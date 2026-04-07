"use client"

import { useEffect, useState } from "react"
import AdminGuard from "@/components/AdminGuard"
import { notificationsService } from "@/lib/services/notificationsService"
import { Button } from "@/components/ui/button"
import { Bell, Check, UserPlus, X, Mail, Phone, ShieldCheck, User } from "lucide-react"
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState(null)
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "User",
  })

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

  const handleMakeAccount = (notif) => {
    let meta = notif.metadata || {}
    if (typeof meta === "string") {
      try { meta = JSON.parse(meta) } catch (e) {}
    }
    setSelectedNotificationId(notif.id)
    setCreateUserForm({
      name: "",
      email: meta.email || "",
      phone: meta.phone || "",
      role: "User",
    })
    setIsCreateModalOpen(true)
  }

  const handleCreateUser = async () => {
    const name = createUserForm.name.trim()
    if (!selectedNotificationId) return
    if (!name) {
      toast.error("Please enter the user's full name")
      return
    }
    if (!createUserForm.email.trim()) {
      toast.error("Email is required")
      return
    }

    try {
      setCreatingUser(true)
      await notificationsService.makeUserFromNotification(selectedNotificationId, {
        name,
        email: createUserForm.email,
        phone: createUserForm.phone,
      })
      toast.success("Account created — login credentials sent to " + createUserForm.email)
      setNotifications((prev) =>
        prev.filter((n) => n.id !== selectedNotificationId)
      )
      setIsCreateModalOpen(false)
      setSelectedNotificationId(null)
    } catch (error) {
      const msg = error?.message || "Failed to create user account"
      toast.error(msg)
    } finally {
      setCreatingUser(false)
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

  const handleModalClose = () => {
    if (creatingUser) return
    setIsCreateModalOpen(false)
    setSelectedNotificationId(null)
  }

  return (
    <AdminGuard>
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
                              onClick={() => handleMakeAccount(notif)}
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

      {/* ── Create User Modal ─────────────────────────────────────────────── */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl">

          {/* Gradient header banner */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-semibold">
                  Create User Account
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-sm mt-0.5">
                  Fill in the name — email and phone are pre-filled from the trial request.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="px-6 pt-5 pb-2 space-y-4 -mt-3">

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cu-name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Full Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cu-name"
                autoFocus
                placeholder="e.g. John Smith"
                value={createUserForm.name}
                onChange={(e) =>
                  setCreateUserForm((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
                className="h-10"
              />
            </div>

            {/* Email — read-only, pre-filled */}
            <div className="space-y-1.5">
              <Label htmlFor="cu-email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Email Address
              </Label>
              <Input
                id="cu-email"
                type="email"
                readOnly
                value={createUserForm.email}
                className="h-10 bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 cursor-default select-all"
              />
            </div>

            {/* Phone — read-only, pre-filled */}
            <div className="space-y-1.5">
              <Label htmlFor="cu-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Phone Number
              </Label>
              <Input
                id="cu-phone"
                readOnly
                value={createUserForm.phone || "—"}
                className="h-10 bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 cursor-default"
              />
            </div>

            {/* Role — read-only, always User */}
            <div className="space-y-1.5">
              <Label htmlFor="cu-role" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                Role
              </Label>
              <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  User
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Cannot be changed here
                </span>
              </div>
            </div>

          </div>

          {/* Info strip */}
          <div className="mx-6 mb-4 mt-1 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 flex items-start gap-2">
            <span className="text-amber-500 text-base leading-none mt-0.5">ℹ</span>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              A temporary password will be auto-generated and emailed to the user with their login credentials.
            </p>
          </div>

          <DialogFooter className="px-6 pb-5 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleModalClose}
              disabled={creatingUser}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:opacity-90 transition-opacity font-semibold"
              onClick={handleCreateUser}
              disabled={creatingUser || !createUserForm.name.trim()}
            >
              {creatingUser ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  )
}