"use client"

import { useState, useEffect } from "react"
import AuthGuard from '@/components/AuthGuard'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ticketsService from "@/lib/services/ticketsService"
import { Loader2, AlertCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function TicketsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null) // null, 'EVENTS', or 'HOSTS'
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTicketId, setActiveTicketId] = useState(null)
  const [editingKey, setEditingKey] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [savingKey, setSavingKey] = useState(null)
  const [deletingTicketId, setDeletingTicketId] = useState(null)

  const priorityOptions = [
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ]

  const statusOptions = [
    { label: 'Reported', value: 'REPORTED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'RESOLVED' },
  ]

  useEffect(() => {
    if (selectedCategory) {
      fetchTickets(selectedCategory)
    } else {
      setTickets([])
    }
  }, [selectedCategory])

  const fetchTickets = async (category) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.listTickets(category)
      if (response?.data) {
        setTickets(response.data)
      } else {
        setTickets([])
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError('Failed to fetch tickets')
      toast.error('Failed to fetch tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const getReporterValue = (ticket) => {
    return ticket.reporterName || ticket.createdBy?.name || ticket.createdBy?.email || ''
  }

  const buildUpdatePayload = (field, value) => {
    switch (field) {
      case 'title': {
        const trimmed = value.trim()
        if (!trimmed) {
          throw new Error('Title cannot be empty')
        }
        return { title: trimmed }
      }
      case 'assignTo':
        return { assignTo: value?.trim() || 'Unassigned' }
      case 'reporterName':
        return { reporterName: value?.trim() || '' }
      case 'priority':
        return { priority: value }
      case 'status':
        return { status: value }
      default:
        return {}
    }
  }

  const applyTicketChanges = (ticketId, updates) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, ...updates }
          : ticket
      )
    )
  }

  const handleInlineUpdate = async (ticketId, field, value) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return

    const existingValue = (() => {
      if (field === 'reporterName') return getReporterValue(ticket)
      if (field === 'assignTo') return ticket.assignTo || 'Unassigned'
      return ticket[field] ?? ''
    })()

    const shouldTrim = field === 'title' || field === 'assignTo' || field === 'reporterName'
    const normalizedIncoming = shouldTrim ? (value ?? '').trim() : value
    const normalizedExisting = shouldTrim ? (existingValue ?? '').trim() : existingValue

    if (normalizedIncoming === normalizedExisting) {
      setEditingKey(null)
      return
    }

    try {
      const payload = buildUpdatePayload(field, value)
      setSavingKey(`${ticketId}-${field}`)
      await ticketsService.updateTicket(ticketId, payload)
      applyTicketChanges(ticketId, payload)
      toast.success('Ticket updated')
    } catch (err) {
      console.error('Failed to update ticket field:', err)
      toast.error(err?.message || 'Failed to update ticket')
    } finally {
      setSavingKey(null)
      setEditingKey(null)
      setEditValues((prev) => {
        const updated = { ...prev }
        delete updated[`${ticketId}-${field}`]
        return updated
      })
    }
  }

  const startEditing = (ticketId, field, value) => {
    setEditingKey(`${ticketId}-${field}`)
    setEditValues((prev) => ({
      ...prev,
      [`${ticketId}-${field}`]: value ?? '',
    }))
  }

  const handleEditChange = (ticketId, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [`${ticketId}-${field}`]: value,
    }))
  }

  const handleInputKeyDown = (event, ticketId, field) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleInlineUpdate(ticketId, field, editValues[`${ticketId}-${field}`] ?? '')
    }
    if (event.key === 'Escape') {
      setEditingKey(null)
      setEditValues((prev) => {
        const updated = { ...prev }
        delete updated[`${ticketId}-${field}`]
        return updated
      })
    }
  }

  const handleSelectTicket = (ticketId) => {
    setActiveTicketId(ticketId)
    toast.info('Ticket selected', {
      description: 'You can now edit the fields inline.',
    })
  }

  const handleDeleteTicket = async (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return
    const confirmed = window.confirm(`Delete ticket "${ticket.title || 'Untitled'}"?`)
    if (!confirmed) return

    try {
      setDeletingTicketId(ticketId)
      await ticketsService.deleteTicket(ticketId)
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      toast.success('Ticket deleted')
    } catch (err) {
      console.error('Failed to delete ticket:', err)
      toast.error(err?.message || 'Failed to delete ticket')
    } finally {
      setDeletingTicketId(null)
    }
  }

  const renderEditableText = (ticket, field, placeholder) => {
    const key = `${ticket.id}-${field}`
    const isEditing = editingKey === key
    const displayValue =
      field === 'reporterName'
        ? getReporterValue(ticket)
        : field === 'assignTo'
          ? ticket.assignTo || 'Unassigned'
          : ticket[field] || ''

    if (isEditing) {
      return (
        <input
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          value={editValues[key] ?? ''}
          autoFocus
          onChange={(event) => handleEditChange(ticket.id, field, event.target.value)}
          onBlur={() => handleInlineUpdate(ticket.id, field, editValues[key] ?? '')}
          onKeyDown={(event) => handleInputKeyDown(event, ticket.id, field)}
        />
      )
    }

    return (
      <button
        type="button"
        className="w-full text-left text-sm text-foreground hover:text-primary"
        onClick={() => startEditing(ticket.id, field, displayValue)}
      >
        {displayValue || placeholder}
      </button>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'REPORTED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-neutral-800 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Information Technology Systems Management
          </h1>
        </div>

        {/* Category Selection */}
        <div className="flex gap-4">
          <Button
            onClick={() => setSelectedCategory('EVENTS')}
            variant={selectedCategory === 'EVENTS' ? 'default' : 'outline'}
            className={cn(
              "min-w-[120px]",
              selectedCategory === 'EVENTS' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent"
            )}
          >
            Events
          </Button>
          <Button
            onClick={() => setSelectedCategory('HOSTS')}
            variant={selectedCategory === 'HOSTS' ? 'default' : 'outline'}
            className={cn(
              "min-w-[120px]",
              selectedCategory === 'HOSTS' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent"
            )}
          >
            Hosts
          </Button>
        </div>

        {/* Table Section */}
        {selectedCategory ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tickets...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <span className="ml-3 text-red-600 dark:text-red-400">{error}</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    No tickets found
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No {selectedCategory.toLowerCase()} tickets available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead className="border-b border-gray-200 dark:border-neutral-800 bg-muted/30 dark:bg-neutral-900/70">
                    <tr className="text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[400px]">
                        Ticket
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[180px]">
                        Assignee
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[180px]">
                        Reporter
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[150px]">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[180px]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[140px]">
                        Resolution
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[200px]">
                        Created At
                      </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[100px]">
                      Actions
                    </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {tickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={cn(
                          "transition-colors hover:bg-muted/50 dark:hover:bg-neutral-800/60",
                        ticket.id === activeTicketId && "ring-1 ring-primary",
                          index % 2 === 0 
                            ? "bg-background dark:bg-neutral-950/50" 
                            : "bg-muted/20 dark:bg-neutral-900/50"
                        )}
                      >
                        <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectTicket(ticket.id)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold uppercase transition-colors",
                                ticket.id === activeTicketId
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary"
                              )}
                            >
                              {`TC:${index + 1}`}
                            </button>
                            
                          </div>
                          <div className="text-sm text-foreground">
                            {renderEditableText(ticket, 'title', ticket.problemName || 'No title')}
                          </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                        {renderEditableText(ticket, 'assignTo', 'Unassigned')}
                        </td>
                        <td className="px-6 py-4">
                        {renderEditableText(ticket, 'reporterName', 'Unknown')}
                        </td>
                        <td className="px-6 py-4">
                        <select
                          className="w-32 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={ticket.priority || 'MEDIUM'}
                          onChange={(event) => handleInlineUpdate(ticket.id, 'priority', event.target.value)}
                          disabled={savingKey === `${ticket.id}-priority`}
                        >
                          {priorityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        </td>
                        <td className="px-6 py-4">
                        <select
                          className="w-36 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={ticket.status || 'REPORTED'}
                          onChange={(event) => handleInlineUpdate(ticket.id, 'status', event.target.value)}
                          disabled={savingKey === `${ticket.id}-status`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">
                          {ticket.status === 'RESOLVED' 
                            ? 'Resolved' 
                            : 'Unresolved'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="rounded-full border border-destructive/30 p-2 text-destructive transition-colors hover:bg-destructive/10"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          disabled={deletingTicketId === ticket.id}
                          aria-label="Delete ticket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-8">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Please select either <strong>Events</strong> or <strong>Hosts</strong> to view tickets.
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
