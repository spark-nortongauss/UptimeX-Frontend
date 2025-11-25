"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const PRIORITY_OPTIONS = [
  { label: "Urgent", value: "URGENT" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
]

const PRIORITY_DUE_DATE_HOURS = {
  URGENT: 4,
  HIGH: 12,
  MEDIUM: 24,
  LOW: 48,
}

const ASSIGNEE_OPTIONS = [
  { label: "Unassigned", value: "Unassigned" },
  { label: "Network Team", value: "Network Team" },
  { label: "Hardware Team", value: "Hardware Team" },
  { label: "Support Team", value: "Support Team" },
  { label: "Individual Users", value: "Individual Users" },
]

const textareaClassName =
  "min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

export function TicketDrawer({
  open,
  onClose,
  formData,
  onFieldChange,
  onDueDateChange,
  onSubmit,
  isSubmitting,
  error,
  dueDateTouched,
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (open) {
      // Delay to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [open])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 right-0 h-[90vh] w-full sm:w-[600px] lg:w-[700px] bg-background border-l border-t border-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out rounded-tl-2xl",
          isVisible ? "translate-x-0 translate-y-0" : "translate-x-full translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create Ticket</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Link the selected event problem to a support ticket. Required fields are marked.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="shrink-0 hover:bg-muted"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {formData ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-event-id">Event ID</Label>
                  <Input id="ticket-event-id" value={formData.eventId} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-host-name">Host Name</Label>
                  <Input id="ticket-host-name" value={formData.hostName} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-problem-name">Problem Name</Label>
                  <Input id="ticket-problem-name" value={formData.problemName} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-severity">Severity</Label>
                  <Input id="ticket-severity" value={formData.severity} readOnly />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ticket-problem-description">Problem Description</Label>
                </div>
                <textarea
                  id="ticket-problem-description"
                  value={formData.problemDescription || ""}
                  onChange={(event) => onFieldChange("problemDescription", event.target.value)}
                  className={textareaClassName}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ticket-title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {(formData.title?.length ?? 0)}/500
                    </span>
                  </div>
                  <Input
                    id="ticket-title"
                    value={formData.title}
                    onChange={(event) => onFieldChange("title", event.target.value.slice(0, 500))}
                    placeholder="Describe the issue"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ticket-category">Category</Label>
                    <span className="text-xs text-transparent select-none">0/0</span>
                  </div>
                  <Input id="ticket-category" value="Events" readOnly />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Priority <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => onFieldChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assign To</Label>
                  <Select
                    value={formData.assignTo}
                    onValueChange={(value) => onFieldChange("assignTo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNEE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-due-date">Due Date</Label>
                  <Input
                    id="ticket-due-date"
                    type="datetime-local"
                    value={formData.dueDate || ""}
                    onChange={(event) => onDueDateChange(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-set based on priority ({PRIORITY_DUE_DATE_HOURS[formData.priority] ?? 24}h SLA)
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-description">Description</Label>
                <textarea
                  id="ticket-description"
                  value={formData.description || ""}
                  onChange={(event) => onFieldChange("description", event.target.value)}
                  className={textareaClassName}
                  rows={5}
                  placeholder="Add more context or troubleshooting notes..."
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-muted-foreground/40 p-6 text-sm text-muted-foreground">
              Select an event row to preload ticket details.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || !formData}>
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </div>
    </>
  )
}

export default TicketDrawer