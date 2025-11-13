"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  RefreshCw,
  ScrollText,
  Server,
  Tag,
  Search,
  Cpu,
  CheckCircle2,
  Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
 
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useZabbixStore } from "@/lib/stores/zabbixStore"
import { useEventsTimeframeStore } from "@/lib/stores/eventsTimeframeStore"

const ROW_SIZE_OPTIONS = [10, 25, 50, 100]

const severityStyles = (sev) => {
  switch (sev) {
    case "CRITICAL":
      return "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200"
    case "MAJOR":
      return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
    case "MINOR":
    default:
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
  }
}

const severityIcon = (sev) => {
  switch (sev) {
    case "CRITICAL":
      return <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
    case "MAJOR":
      return <Activity className="h-3.5 w-3.5 animate-pulse" />
    case "MINOR":
    default:
      return <CircleDot className="h-3.5 w-3.5" />
  }
}

const buildPaginationRange = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const range = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  if (left > 2) {
    range.push("ellipsis-left")
  }

  for (let page = left; page <= right; page += 1) {
    range.push(page)
  }

  if (right < total - 1) {
    range.push("ellipsis-right")
  }

  range.push(total)
  return range
}

export default function EventsTable() {
  const {
    problems,
    loading,
    error,
    fetchProblems,
  } = useZabbixStore()

  const mode = useEventsTimeframeStore((state) => state.mode)
  const dateFrom = useEventsTimeframeStore((state) => state.dateFrom)
  const timeFrom = useEventsTimeframeStore((state) => state.timeFrom)
  const dateTo = useEventsTimeframeStore((state) => state.dateTo)
  const timeTo = useEventsTimeframeStore((state) => state.timeTo)
  const getRangeInfo = useEventsTimeframeStore((state) => state.getRangeInfo)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ROW_SIZE_OPTIONS[0])
  const [isVisible, setIsVisible] = useState(false)
  const [selectedQuickAction, setSelectedQuickAction] = useState(null) // 'ai', 'ticket', 'acknowledge'
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportPDFChecked, setExportPDFChecked] = useState(true)
  const [exportCSVChecked, setExportCSVChecked] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState(null)

  const activeRange = useMemo(() => getRangeInfo(), [getRangeInfo, mode, dateFrom, timeFrom, dateTo, timeTo])
  const timeFromSeconds = activeRange?.time_from ?? null
  const timeTillSeconds = activeRange?.time_till ?? null

  // Fetch events whenever the timeframe changes
  useEffect(() => {
    const params =
      mode === "range" && timeFromSeconds && timeTillSeconds
        ? { limit: 500, time_from: timeFromSeconds, time_till: timeTillSeconds }
        : { limit: 500 }
    fetchProblems(params)
  }, [fetchProblems, mode, timeFromSeconds, timeTillSeconds])

  // Trigger entrance animation
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  // Reset pagination when search or timeframe updates
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, mode, timeFromSeconds, timeTillSeconds])

  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return problems
      .filter((alarm) => {
        if (!query) return true
        return (
          alarm.problem?.toLowerCase().includes(query) ||
          alarm.host?.toLowerCase().includes(query) ||
          alarm.group?.toLowerCase().includes(query)
        )
      })
      .filter((alarm) => {
        if (mode !== "range" || !timeFromSeconds || !timeTillSeconds || !alarm.timestamp) return true
        return alarm.timestamp >= timeFromSeconds && alarm.timestamp <= timeTillSeconds
      })
      .sort((a, b) => {
        const aTime = a.timestamp ?? 0
        const bTime = b.timestamp ?? 0
        return bTime - aTime
      })
  }, [problems, searchQuery, mode, timeFromSeconds, timeTillSeconds])

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProblems = filteredProblems.slice(startIndex, endIndex)
  const paginationRange = useMemo(
    () => buildPaginationRange(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  )

  const exportRecords = useMemo(() => filteredProblems.map((p) => ({ host: p.host, problem: p.problem })), [filteredProblems])

  const EXPORT_HEADERS = ["Host Name", "Problem"]
  const filenameSuffix = () => new Date().toISOString().replace(/[:.]/g, "-")
  const buildCSVFromRecords = (records, headers) => {
    const escape = (val) => {
      if (val == null) return ""
      const s = String(val)
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }
    const lines = [headers.join(",")]
    for (const r of records) {
      lines.push([escape(r.host), escape(r.problem)].join(","))
    }
    return lines.join("\n")
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const loadJsPDF = async () => {
    if (typeof window !== "undefined" && window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF
    }
    await new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      script.async = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
    return window.jspdf.jsPDF
  }

  const exportCSV = async () => {
    const csv = buildCSVFromRecords(exportRecords, EXPORT_HEADERS)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const ts = filenameSuffix()
    downloadBlob(blob, `events-export-${ts}.csv`)
  }

  const exportPDF = async () => {
    const JsPDF = await loadJsPDF()
    const doc = new JsPDF({ unit: "pt", format: "a4" })

    const marginLeft = 40
    const marginTop = 50
    const lineHeight = 18
    const pageWidth = doc.internal.pageSize.getWidth()
    const usableWidth = pageWidth - marginLeft * 2

    doc.setFontSize(16)
    doc.text("Events Export", marginLeft, marginTop)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, marginTop + 20)

    let y = marginTop + 50
    doc.setFont(undefined, "bold")
    doc.setFontSize(12)
    doc.text(EXPORT_HEADERS[0], marginLeft, y)
    doc.text(EXPORT_HEADERS[1], marginLeft + usableWidth * 0.45, y)
    doc.setFont(undefined, "normal")
    y += 8
    doc.setLineWidth(0.5)
    doc.line(marginLeft, y, marginLeft + usableWidth, y)
    y += 12

    for (const r of exportRecords) {
      if (y > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage()
        y = marginTop
      }
      doc.setFontSize(11)
      doc.text(String(r.host || ""), marginLeft, y)
      doc.text(String(r.problem || ""), marginLeft + usableWidth * 0.45, y)
      y += lineHeight
    }

    const pdfBlob = doc.output("blob")
    const ts = filenameSuffix()
    downloadBlob(pdfBlob, `events-export-${ts}.pdf`)
  }

  const handleExportConfirm = async () => {
    setExportError(null)
    if (!exportPDFChecked && !exportCSVChecked) {
      setExportError("Select at least one format to export")
      return
    }
    setExportLoading(true)
    try {
      if (exportPDFChecked) await exportPDF()
      if (exportCSVChecked) await exportCSV()
      setExportOpen(false)
    } catch (e) {
      console.error("Export failed", e)
      setExportError("Failed to generate export files. Please try again.")
    } finally {
      setExportLoading(false)
    }
  }

  const handleItemsPerPageChange = (value) => {
    const parsed = Number(value)
    setItemsPerPage(parsed)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleRefresh = () => {
    const params =
      mode === "range" && timeFromSeconds && timeTillSeconds
        ? { limit: 500, time_from: timeFromSeconds, time_till: timeTillSeconds }
        : { limit: 500 }
    fetchProblems(params)
  }

  const totalCount = filteredProblems.length
  const showingFrom = totalCount === 0 ? 0 : startIndex + 1
  const showingTo = Math.min(endIndex, totalCount)

  if (loading && problems.length === 0) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-neutral-900 dark:to-neutral-900/50 animate-fade-in">
        <CardHeader className="border-b border-gray-200/60 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 animate-pulse">
              <Server className="h-6 w-6" />
            </div>
            Events Timeline
            <div className="ml-auto">
              <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="h-10 w-full max-w-md bg-gray-200 dark:bg-neutral-800 rounded-md animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 dark:bg-neutral-800 rounded-md animate-pulse" />
          </div>
          <div className="overflow-auto rounded-xl border border-gray-200/60 dark:border-neutral-800">
            <div className="min-h-[320px] space-y-4 p-6">
              <div className="h-10 w-full bg-gray-100 dark:bg-neutral-900 rounded-md animate-pulse" />
              <div className="h-10 w-full bg-gray-100 dark:bg-neutral-900 rounded-md animate-pulse" />
              <div className="h-10 w-full bg-gray-100 dark:bg-neutral-900 rounded-md animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 animate-shake">
        <CardHeader className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-red-700">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-600 animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
            Events Timeline - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-10 text-center">
            <div className="text-red-500 mb-4 text-4xl animate-bounce">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">Unable to load events</p>
            <p className="text-gray-600">{error}</p>
            <Button className="mt-6" onClick={handleRefresh} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card
      className={cn(
        "overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-neutral-900 dark:to-neutral-900/50 transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <CardHeader className="border-b border-border bg-background/80 backdrop-blur-sm dark:bg-neutral-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <ScrollText className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">Events Timeline</CardTitle>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search events by name, host or group..."
                className="w-full bg-background text-foreground placeholder:text-muted-foreground sm:w-72"
              />
              <Button variant="outline" size="icon" onClick={handleRefresh} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <span className="text-sm text-muted-foreground">
                {totalCount === 1 ? "1 event found" : `${totalCount} events found`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rows
                </span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-24 bg-background">
                    <SelectValue placeholder={`${itemsPerPage}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {ROW_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-2 px-6 py-4 text-xs uppercase tracking-wide text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-muted-foreground">
              {mode === "range" && dateFrom && timeFrom && dateTo && timeTo ? (
                <>
                  From <strong>{dateFrom} {timeFrom}</strong> to{" "}
                  <strong>{dateTo} {timeTo}</strong>
                </>
              ) : (
                "Showing all time"
              )}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button 
              size="sm"
              className="bg-[#5771d7] hover:bg-[#495fc0] text-white font-bold gap-2 border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => setExportOpen(true)}
              aria-label="Open export options dialog"
            >
              <Download className="h-4 w-4" strokeWidth={3} />
              Export
            </Button>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick Actions:
            </span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className={cn(
                  "bg-lime-500 hover:bg-lime-600 text-white font-bold border-0 shadow-sm",
                  selectedQuickAction === 'ai' && "ring-2 ring-lime-400 ring-offset-2"
                )}
                onClick={() => {
                  setSelectedQuickAction(selectedQuickAction === 'ai' ? null : 'ai')
                  setSelectedRowId(null)
                }}
              >
                <Cpu className="h-4 w-4 mr-1.5" />
                AI
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className={cn(
                  "dark:hover:bg-neutral-800 dark:text-white",
                  selectedQuickAction === 'ticket' && "ring-2 ring-blue-400 ring-offset-2"
                )}
                onClick={() => {
                  setSelectedQuickAction(selectedQuickAction === 'ticket' ? null : 'ticket')
                  setSelectedRowId(null)
                }}
              >
                Ticket
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className={cn(
                  "dark:hover:bg-neutral-800 dark:text-white",
                  selectedQuickAction === 'acknowledge' && "ring-2 ring-green-400 ring-offset-2"
                )}
                onClick={() => {
                  setSelectedQuickAction(selectedQuickAction === 'acknowledge' ? null : 'acknowledge')
                  setSelectedRowId(null)
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Acknowledge
              </Button>
            </div>
            {selectedQuickAction && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Please select an event row to {selectedQuickAction === 'ai' ? 'analyze' : selectedQuickAction === 'ticket' ? 'create a ticket for' : 'acknowledge'}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30 dark:bg-neutral-900/70">
              <tr className="text-left">
                {["Host Name", "Host Groups", "Severity", "Status", "Problem", "Age", "Timestamp"].map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      "px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-all duration-300",
                      index === 0 ? "font-bold" : "font-normal",
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    )}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400 animate-fade-in">
                      <div className="rounded-full bg-gray-100 p-4 dark:bg-neutral-800 animate-pulse">
                        <CircleDot className="h-8 w-8" />
                      </div>
                      <div className="animate-fade-in-up">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                          No events match the current filters
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Try adjusting your search or time range filters.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((alarm, index) => (
                  <tr
                    key={alarm.id}
                    className={cn(
                      "group transition-all duration-200 ease-out hover:bg-muted/50 dark:hover:bg-neutral-800/60",
                      index % 2 === 0 ? "bg-background dark:bg-neutral-950/50" : "bg-muted/20 dark:bg-neutral-900/50",
                      isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
                      selectedQuickAction && "cursor-pointer",
                      selectedRowId === alarm.id && selectedQuickAction && "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                    )}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                      animationDelay: `${index * 100}ms`,
                    }}
                    onClick={() => {
                      if (selectedQuickAction) {
                        setSelectedRowId(alarm.id)
                        // TODO: Implement the actual action when features are ready
                        console.log(`Selected ${selectedQuickAction} action for event:`, alarm)
                      }
                    }}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-3 text-sm font-semibold transition-colors duration-200",
                          alarm.host === "Unknown Host"
                            ? "text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
                          <Server className="h-4 w-4" />
                        </div>
                        {alarm.host}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-3 text-sm text-muted-foreground",
                          alarm.group === "Unknown Group" ? "" : "text-foreground"
                        )}
                      >
                        <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
                          <Tag className="h-4 w-4" />
                        </div>
                        {alarm.group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm",
                          severityStyles(alarm.severity)
                        )}
                      >
                        {severityIcon(alarm.severity)}
                        {alarm.severity || "MINOR"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <span
                          className={cn(
                            "relative h-3 w-3 rounded-full",
                            alarm.status === "PROBLEM" ? "bg-red-500" : "bg-yellow-500"
                          )}
                        >
                          <span className="absolute inset-0 rounded-full opacity-40 animate-ping" />
                          <span className="absolute inset-0 rounded-full opacity-60 animate-pulse" />
                        </span>
                        <span
                          className={cn(
                            alarm.status === "PROBLEM" ? "text-red-600" : "text-yellow-600",
                            "uppercase tracking-wide"
                          )}
                        >
                          {alarm.status}
                        </span>
                      </div>
                    </td>
                    <td className="min-w-[320px] px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-foreground">{alarm.problem}</span>
                        {alarm.opdata && (
                          <span className="text-xs text-muted-foreground">{alarm.opdata}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                        </div>
                        {alarm.age}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {alarm.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-border bg-muted/20 px-6 py-4 text-sm text-muted-foreground dark:bg-neutral-900/70 md:flex-row md:items-center md:justify-between">
          <div>
            Showing <span className="font-semibold text-foreground">{showingFrom}</span>-
            <span className="font-semibold text-foreground">{showingTo}</span> of{" "}
            <span className="font-semibold text-primary">{totalCount}</span> events
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={safeCurrentPage === 1}
              className="inline-flex items-center gap-2 font-semibold transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-950/20 dark:hover:text-blue-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {paginationRange.map((page) =>
                typeof page === "string" ? (
                  <span key={page} className="px-2 text-muted-foreground">
                    &hellip;
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === safeCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-9 w-9 px-0",
                      page === safeCurrentPage
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        : "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:text-blue-300"
                    )}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={safeCurrentPage === totalPages}
              className="inline-flex items-center gap-2 font-semibold transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-950/20 dark:hover:text-blue-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
      <DialogContent aria-label="Export options" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Events</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <label htmlFor="export-pdf" className="flex-1 text-sm font-medium text-foreground">
              PDF (Host Name, Problem)
            </label>
            <input
              id="export-pdf"
              type="checkbox"
              aria-label="Select PDF format"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={exportPDFChecked}
              onChange={(e) => setExportPDFChecked(e.target.checked)}
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <label htmlFor="export-csv" className="flex-1 text-sm font-medium text-foreground">
              CSV (Host Name, Problem)
            </label>
            <input
              id="export-csv"
              type="checkbox"
              aria-label="Select CSV format"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={exportCSVChecked}
              onChange={(e) => setExportCSVChecked(e.target.checked)}
            />
          </div>
          {exportError && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">
              <AlertTriangle className="h-4 w-4" />
              {exportError}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setExportOpen(false)}
            aria-label="Cancel export"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportConfirm}
            disabled={exportLoading}
            aria-label="Confirm export"
            className="gap-2"
          >
            {exportLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            {exportLoading ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
