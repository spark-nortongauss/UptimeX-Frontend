"use client"

import { useEffect, useState } from "react"
import AdminGuard from "@/components/AdminGuard"
import { notificationsService } from "@/lib/services/notificationsService"
import { Button } from "@/components/ui/button"
import { Bell, Check, UserPlus, X, Mail, Phone, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteNotif, setInviteNotif] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [inviteSubmitting, setInviteSubmitting] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getNotifications()
      setNotifications(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleDecline = async (id) => {
    try {
      await notificationsService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast.success("Request declined")
    } catch (e) {
      console.error(e)
    }
  }

  const openInviteModal = (notif) => {
    setInviteNotif(notif)
    setName("")
    setEmail("")
    setPhone("")
    setInviteOpen(true)
  }

  const resetInviteModal = () => {
    setInviteOpen(false)
    setInviteNotif(null)
    setName("")
    setEmail("")
    setPhone("")
  }

  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    if (!inviteNotif || !name.trim() || !email.trim()) {
      toast.error("Name and email are required")
      return
    }
    setInviteSubmitting(true)
    try {
      const result = await notificationsService.makeUserFromTrial(inviteNotif.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      })
      if (result?.action === "reset_sent") {
        toast.success("User already existed. Sent a password setup email instead.")
      } else {
        toast.success("Invitation sent. The user will receive an email to set their password.")
      }
      setNotifications((prev) => prev.filter((n) => n.id !== inviteNotif.id))
      resetInviteModal()
    } catch (err) {
      const msg = err?.message || "Could not send invitation"
      toast.error(msg)
    } finally {
      setInviteSubmitting(false)
    }
  }

  return (
    <AdminGuard>
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          if (!open && !inviteSubmitting) resetInviteModal()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
            <DialogDescription>
              Enter the details manually and send an invitation email. Role is always{" "}
              <span className="font-medium text-foreground">user</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name</Label>
              <Input
                id="invite-name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                required
                autoComplete="name"
                disabled={inviteSubmitting}
                placeholder="e.g. Shovon Saiful"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground" htmlFor="invite-email">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                id="invite-email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
                autoComplete="email"
                disabled={inviteSubmitting}
                placeholder="user@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground" htmlFor="invite-phone">
                <Phone className="h-3.5 w-3.5" />
                Phone (optional)
              </Label>
              <Input
                id="invite-phone"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                autoComplete="tel"
                disabled={inviteSubmitting}
                placeholder="e.g. 017xxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Role
              </Label>
              <Input readOnly value="user" className="bg-muted/50" />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={resetInviteModal} disabled={inviteSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteSubmitting}>
                {inviteSubmitting ? "Sending…" : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="max-w-5xl mx-auto py-8 px-4 h-full">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-500" />
              Notifications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage all system alerts and trial requests.
            </p>
          </div>
        </div>

        {/* ── List ───────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading notifications…
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                All caught up!
              </p>
              <p>You have no new notifications right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {notifications.map((notif) => {
                let meta = notif.metadata || {}
                if (typeof meta === "string") {
                  try { meta = JSON.parse(meta) } catch (e) {}
                }
                const isTrialRequest = meta.type === "trial_request"

                return (
                  <div
                    key={notif.id}
                    className={`p-6 hover:bg-gray-50/50 dark:hover:bg-neutral-800/20 transition-colors flex gap-4 ${
                      !notif.is_read ? "bg-blue-50/30 dark:bg-blue-900/5" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="mt-1 flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          !notif.is_read
                            ? "bg-blue-500"
                            : "bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700"
                        }`}
                      />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <p
                          className={`text-base ${
                            !notif.is_read
                              ? "text-gray-900 dark:text-white font-medium"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>

                      {isTrialRequest && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-neutral-800 inline-flex items-center gap-3">
                          <span className="font-medium">Contact:</span>
                          <span>{meta.email}</span>
                          {meta.phone && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span>{meta.phone}</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="pt-4 flex flex-wrap gap-2">
                        {!notif.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-medium"
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        {isTrialRequest && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-sm hover:shadow-md hover:opacity-90 transition-all"
                              onClick={() => openInviteModal(notif)}
                            >
                              <UserPlus className="w-3.5 h-3.5 mr-1" />
                              Make User
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                              onClick={() => handleDecline(notif.id)}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}