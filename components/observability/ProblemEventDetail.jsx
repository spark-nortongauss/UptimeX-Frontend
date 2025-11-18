"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, AlertTriangle, Activity, CheckCircle2, TrendingUp, Users, Bell, Settings, BarChart3, Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { zabbixService } from "@/lib/services/zabbixService"
import SeverityGraph from "./SeverityGraph"
import { cn } from "@/lib/utils"

const severityLabels = {
  0: "Not classified",
  1: "Information",
  2: "Warning",
  3: "Average",
  4: "High",
  5: "Disaster"
}

const severityColors = {
  0: "bg-gray-500",
  1: "bg-blue-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-purple-500"
}

export default function ProblemEventDetail({ eventId, onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportPDFChecked, setExportPDFChecked] = useState(true)
  const [exportCSVChecked, setExportCSVChecked] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await zabbixService.getProblemEventHistory(eventId)
        if (response.success) {
          setData(response.data)
        } else {
          setError(response.message || "Failed to load event history")
        }
      } catch (err) {
        console.error("Failed to fetch event history:", err)
        setError(err.message || "Failed to load event history")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchData()
    }
  }, [eventId])

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A"
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    return parts.length > 0 ? parts.join(" ") : "< 1m"
  }

  // Get host name from event timeline or problem details
  const getHostName = () => {
    if (data?.eventTimeline && data.eventTimeline.length > 0) {
      const firstEvent = data.eventTimeline[0]
      if (firstEvent.hosts && firstEvent.hosts.length > 0) {
        return firstEvent.hosts[0].name
      }
    }
    if (data?.problemDetails?.hosts && data.problemDetails.hosts.length > 0) {
      return data.problemDetails.hosts[0].name
    }
    return "N/A"
  }

  // Export functions
  const filenameSuffix = () => new Date().toISOString().replace(/[:.]/g, "-")

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
    if (!data) return

    const escape = (val) => {
      if (val == null) return ""
      const s = String(val)
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }

    const lines = []
    
    // Header
    lines.push("Problem Event Details Export")
    lines.push(`Event ID: ${eventId}`)
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push("")

    // Problem Overview
    lines.push("=== PROBLEM OVERVIEW ===")
    lines.push("Host Name," + escape(getHostName()))
    lines.push("Problem Name," + escape(data.problemDetails?.name || "N/A"))
    lines.push("Severity," + escape(severityLabels[data.problemDetails?.severity || 0]))
    lines.push("Status," + escape(data.lifecycle?.isResolved ? "Resolved" : "Active"))
    lines.push("First Occurrence," + escape(formatTimestamp(data.lifecycle?.firstOccurrence)))
    lines.push("Current Duration," + escape(formatDuration(data.lifecycle?.currentDuration)))
    lines.push("Total Occurrences," + escape(data.lifecycle?.totalOccurrences || 0))
    lines.push("Average Duration," + escape(formatDuration(data.lifecycle?.averageDuration)))
    lines.push("")

    // Lifecycle Metrics
    lines.push("=== LIFECYCLE METRICS ===")
    lines.push("Average Duration," + escape(formatDuration(data.lifecycle?.averageDuration)))
    lines.push("Total Occurrences," + escape(data.lifecycle?.totalOccurrences || 0))
    lines.push("Current Duration," + escape(formatDuration(data.lifecycle?.currentDuration)))
    lines.push("Resolved," + escape(data.lifecycle?.isResolved ? "Yes" : "No"))
    lines.push("")

    // Severity Timeline
    if (data.severityTimeline && data.severityTimeline.length > 0) {
      lines.push("=== SEVERITY TIMELINE ===")
      lines.push("Timestamp,Severity,Severity Label,Event ID,Name,Acknowledged")
      data.severityTimeline.forEach((item) => {
        lines.push([
          escape(formatTimestamp(item.timestamp)),
          escape(item.severity),
          escape(severityLabels[item.severity || 0]),
          escape(item.eventId || ""),
          escape(item.name || ""),
          escape(item.acknowledged ? "Yes" : "No")
        ].join(","))
      })
      lines.push("")
    }

    // Event Timeline
    if (data.eventTimeline && data.eventTimeline.length > 0) {
      lines.push("=== EVENT TIMELINE ===")
      lines.push("Event ID,Timestamp,Value,Severity,Name,Hosts,Tags")
      data.eventTimeline.forEach((event) => {
        const hosts = event.hosts ? event.hosts.map(h => h.name).join("; ") : "N/A"
        const tags = event.tags ? event.tags.map(t => `${t.tag}=${t.value || ""}`).join("; ") : "N/A"
        lines.push([
          escape(event.eventid || ""),
          escape(formatTimestamp(event.clock)),
          escape(event.value === "1" ? "PROBLEM" : "OK"),
          escape(severityLabels[event.severity || 0]),
          escape(event.name || ""),
          escape(hosts),
          escape(tags)
        ].join(","))
      })
      lines.push("")
    }

    // Acknowledgment History
    if (data.acknowledgmentHistory && data.acknowledgmentHistory.length > 0) {
      lines.push("=== ACKNOWLEDGMENT HISTORY ===")
      lines.push("Acknowledge ID,User Name,Username,User ID,Timestamp,Message,Action,Event ID,Event Name")
      data.acknowledgmentHistory.forEach((ack) => {
        // Format username properly - handle "uptimex" -> "UptimeX"
        let displayName = ack.fullName;
        if (!displayName && ack.username) {
          if (ack.username.toLowerCase() === 'uptimex') {
            displayName = 'UptimeX';
          } else {
            displayName = ack.username;
          }
        }
        if (!displayName && ack.userid) {
          displayName = ack.userid;
        }
        if (!displayName) {
          displayName = 'Inactive User';
        }
        lines.push([
          escape(ack.acknowledgeid || ""),
          escape(displayName),
          escape(ack.username || ""),
          escape(ack.userid || ""),
          escape(formatTimestamp(ack.clock)),
          escape(ack.message || ""),
          escape(ack.action || 0),
          escape(ack.eventId || ""),
          escape(ack.eventName || "")
        ].join(","))
      })
      lines.push("")
    }

    // Metric History
    if (data.metricHistory && data.metricHistory.length > 0) {
      lines.push("=== METRIC VALUE HISTORY ===")
      lines.push("Timestamp,Item ID,Item Name,Item Key,Value")
      data.metricHistory.forEach((metric) => {
        lines.push([
          escape(formatTimestamp(metric.clock)),
          escape(metric.itemid || ""),
          escape(metric.itemName || ""),
          escape(metric.itemKey || ""),
          escape(metric.value || "")
        ].join(","))
      })
      lines.push("")
    }

    // Alert History
    if (data.alertHistory && data.alertHistory.length > 0) {
      lines.push("=== ALERT HISTORY ===")
      lines.push("Alert ID,Timestamp,Send To,Subject,Message,Status,Retries,Error")
      data.alertHistory.forEach((alert) => {
        lines.push([
          escape(alert.alertid || ""),
          escape(formatTimestamp(alert.clock)),
          escape(alert.sendto || ""),
          escape(alert.subject || ""),
          escape(alert.message || ""),
          escape(alert.status === "1" ? "Sent" : "Failed"),
          escape(alert.retries || 0),
          escape(alert.error || "")
        ].join(","))
      })
      lines.push("")
    }

    // Trigger Configuration
    if (data.triggerConfiguration) {
      lines.push("=== TRIGGER CONFIGURATION ===")
      lines.push("Trigger ID," + escape(data.triggerConfiguration.triggerid || ""))
      lines.push("Description," + escape(data.triggerConfiguration.description || ""))
      lines.push("Expression," + escape(data.triggerConfiguration.expression || ""))
      lines.push("Priority," + escape(severityLabels[data.triggerConfiguration.priority || 0]))
      lines.push("Status," + escape(data.triggerConfiguration.status || ""))
      if (data.triggerConfiguration.tags && data.triggerConfiguration.tags.length > 0) {
        lines.push("Tags," + escape(data.triggerConfiguration.tags.map(t => `${t.tag}=${t.value || ""}`).join("; ")))
      }
      lines.push("")
    }

    // Patterns
    if (data.patterns) {
      lines.push("=== PATTERNS & ANALYSIS ===")
      lines.push("Frequency Trend," + escape(data.patterns.frequency || "stable"))
      lines.push("Average Time Between Occurrences," + escape(formatDuration(data.patterns.averageTimeBetweenOccurrences)))
      lines.push("Typical Severity," + escape(severityLabels[data.patterns.typicalSeverity || 0]))
      lines.push("Typical Resolution Time," + escape(formatDuration(data.patterns.typicalResolutionTime)))
      lines.push("Requires Manual Intervention," + escape(data.patterns.requiresManualIntervention ? "Yes" : "No"))
      lines.push("")
    }

    // Correlated Events (limit to 5 for export)
    if (data.correlatedEvents && data.correlatedEvents.length > 0) {
      lines.push("=== CORRELATED EVENTS ===")
      lines.push("Event ID,Timestamp,Name,Severity,Hosts")
      data.correlatedEvents.slice(0, 5).forEach((event) => {
        const hosts = event.hosts ? event.hosts.map(h => h.name).join("; ") : "N/A"
        lines.push([
          escape(event.eventid || ""),
          escape(formatTimestamp(event.clock)),
          escape(event.name || ""),
          escape(severityLabels[event.severity || 0]),
          escape(hosts)
        ].join(","))
      })
      if (data.correlatedEvents.length > 5) {
        lines.push(`... and ${data.correlatedEvents.length - 5} more events`)
      }
    }

    const csv = lines.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const ts = filenameSuffix()
    downloadBlob(blob, `event-${eventId}-export-${ts}.csv`)
  }

  const exportPDF = async () => {
    if (!data) return

    const JsPDF = await loadJsPDF()
    const doc = new JsPDF({ unit: "pt", format: "a4" })

    const marginLeft = 40
    const marginTop = 50
    const lineHeight = 18
    const pageWidth = doc.internal.pageSize.getWidth()
    const usableWidth = pageWidth - marginLeft * 2
    let y = marginTop

    const addPageIfNeeded = (requiredSpace = 30) => {
      if (y + requiredSpace > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage()
        y = marginTop
      }
    }

    // Header
    doc.setFontSize(16)
    doc.setFont(undefined, "bold")
    doc.text("Problem Event Details Export", marginLeft, y)
    y += 20
    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    doc.text(`Event ID: ${eventId}`, marginLeft, y)
    y += 15
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, y)
    y += 30

    // Problem Overview
    addPageIfNeeded(60)
    doc.setFontSize(14)
    doc.setFont(undefined, "bold")
    doc.text("Problem Overview", marginLeft, y)
    y += 20
    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    
    const overviewData = [
      ["Host Name", getHostName()],
      ["Problem Name", data.problemDetails?.name || "N/A"],
      ["Severity", severityLabels[data.problemDetails?.severity || 0]],
      ["Status", data.lifecycle?.isResolved ? "Resolved" : "Active"],
      ["First Occurrence", formatTimestamp(data.lifecycle?.firstOccurrence)],
      ["Current Duration", formatDuration(data.lifecycle?.currentDuration)],
      ["Total Occurrences", String(data.lifecycle?.totalOccurrences || 0)],
      ["Average Duration", formatDuration(data.lifecycle?.averageDuration)]
    ]

    overviewData.forEach(([label, value]) => {
      addPageIfNeeded()
      doc.setFont(undefined, "bold")
      doc.text(label + ":", marginLeft, y)
      doc.setFont(undefined, "normal")
      const textLines = doc.splitTextToSize(String(value), usableWidth * 0.6)
      doc.text(textLines, marginLeft + 120, y)
      y += Math.max(lineHeight, textLines.length * lineHeight)
    })
    y += 20

    // Lifecycle Metrics
    addPageIfNeeded(60)
    doc.setFontSize(14)
    doc.setFont(undefined, "bold")
    doc.text("Lifecycle Metrics", marginLeft, y)
    y += 20
    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    
    const lifecycleData = [
      ["Average Duration", formatDuration(data.lifecycle?.averageDuration)],
      ["Total Occurrences", String(data.lifecycle?.totalOccurrences || 0)],
      ["Current Duration", formatDuration(data.lifecycle?.currentDuration)],
      ["Resolved", data.lifecycle?.isResolved ? "Yes" : "No"]
    ]

    lifecycleData.forEach(([label, value]) => {
      addPageIfNeeded()
      doc.setFont(undefined, "bold")
      doc.text(label + ":", marginLeft, y)
      doc.setFont(undefined, "normal")
      doc.text(String(value), marginLeft + 120, y)
      y += lineHeight
    })
    y += 20

    // Severity Timeline
    if (data.severityTimeline && data.severityTimeline.length > 0) {
      addPageIfNeeded(60)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Severity Timeline", marginLeft, y)
      y += 20
      doc.setFontSize(9)
      doc.setFont(undefined, "bold")
      doc.text("Timestamp", marginLeft, y)
      doc.text("Severity", marginLeft + 150, y)
      doc.text("Name", marginLeft + 220, y)
      y += 15
      doc.setFont(undefined, "normal")
      
      data.severityTimeline.slice(0, 50).forEach((item) => {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(formatTimestamp(item.timestamp), marginLeft, y)
        doc.text(severityLabels[item.severity || 0], marginLeft + 150, y)
        const nameLines = doc.splitTextToSize(item.name || "", usableWidth - 220)
        doc.text(nameLines, marginLeft + 220, y)
        y += Math.max(lineHeight, nameLines.length * lineHeight)
      })
      if (data.severityTimeline.length > 50) {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(`... and ${data.severityTimeline.length - 50} more entries`, marginLeft, y)
        y += lineHeight
      }
      y += 20
    }

    // Event Timeline
    if (data.eventTimeline && data.eventTimeline.length > 0) {
      addPageIfNeeded(60)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Event Timeline", marginLeft, y)
      y += 20
      doc.setFontSize(9)
      doc.setFont(undefined, "bold")
      doc.text("Timestamp", marginLeft, y)
      doc.text("Type", marginLeft + 150, y)
      doc.text("Name", marginLeft + 200, y)
      y += 15
      doc.setFont(undefined, "normal")
      
      data.eventTimeline.slice(0, 50).forEach((event) => {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(formatTimestamp(event.clock), marginLeft, y)
        doc.text(event.value === "1" ? "PROBLEM" : "OK", marginLeft + 150, y)
        const nameLines = doc.splitTextToSize(event.name || "", usableWidth - 200)
        doc.text(nameLines, marginLeft + 200, y)
        y += Math.max(lineHeight, nameLines.length * lineHeight)
      })
      if (data.eventTimeline.length > 50) {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(`... and ${data.eventTimeline.length - 50} more entries`, marginLeft, y)
        y += lineHeight
      }
      y += 20
    }

    // Acknowledgment History
    if (data.acknowledgmentHistory && data.acknowledgmentHistory.length > 0) {
      addPageIfNeeded(60)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Acknowledgment History", marginLeft, y)
      y += 20
      doc.setFontSize(9)
      
      data.acknowledgmentHistory.slice(0, 30).forEach((ack) => {
        addPageIfNeeded(40)
        doc.setFont(undefined, "bold")
        doc.setFontSize(9)
        // Format username properly - handle "uptimex" -> "UptimeX"
        let userName = ack.fullName;
        if (!userName && ack.username) {
          if (ack.username.toLowerCase() === 'uptimex') {
            userName = 'UptimeX';
          } else {
            userName = ack.username;
          }
        }
        if (!userName && ack.userid) {
          userName = ack.userid;
        }
        if (!userName) {
          userName = 'Inactive User';
        }
        doc.text(`Acknowledged by ${userName} - ${formatTimestamp(ack.clock)}`, marginLeft, y)
        y += 15
        doc.setFont(undefined, "normal")
        doc.setFontSize(8)
        if (ack.message) {
          const msgLines = doc.splitTextToSize(ack.message, usableWidth)
          doc.text(msgLines, marginLeft, y)
          y += msgLines.length * lineHeight
        }
        y += 10
      })
      if (data.acknowledgmentHistory.length > 30) {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(`... and ${data.acknowledgmentHistory.length - 30} more entries`, marginLeft, y)
        y += lineHeight
      }
      y += 20
    }

    // Metric History (summary)
    if (data.metricHistory && data.metricHistory.length > 0) {
      addPageIfNeeded(60)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Metric Value History", marginLeft, y)
      y += 20
      doc.setFontSize(9)
      doc.setFont(undefined, "bold")
      doc.text("Timestamp", marginLeft, y)
      doc.text("Item", marginLeft + 150, y)
      doc.text("Value", marginLeft + 300, y)
      y += 15
      doc.setFont(undefined, "normal")
      
      data.metricHistory.slice(0, 50).forEach((metric) => {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(formatTimestamp(metric.clock), marginLeft, y)
        const itemLines = doc.splitTextToSize(metric.itemName || "N/A", 140)
        doc.text(itemLines, marginLeft + 150, y)
        doc.text(String(metric.value || ""), marginLeft + 300, y)
        y += Math.max(lineHeight, itemLines.length * lineHeight)
      })
      if (data.metricHistory.length > 50) {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(`... and ${data.metricHistory.length - 50} more entries`, marginLeft, y)
        y += lineHeight
      }
      y += 20
    }

    // Alert History
    if (data.alertHistory && data.alertHistory.length > 0) {
      addPageIfNeeded(60)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Alert History", marginLeft, y)
      y += 20
      doc.setFontSize(9)
      
      data.alertHistory.slice(0, 30).forEach((alert) => {
        addPageIfNeeded(50)
        doc.setFont(undefined, "bold")
        doc.text(`${alert.subject || "Alert"} - ${formatTimestamp(alert.clock)}`, marginLeft, y)
        y += 15
        doc.setFont(undefined, "normal")
        doc.setFontSize(8)
        doc.text(`Status: ${alert.status === "1" ? "Sent" : "Failed"}`, marginLeft, y)
        y += 15
        if (alert.sendto) {
          doc.text(`To: ${alert.sendto}`, marginLeft, y)
          y += 15
        }
        if (alert.message) {
          const msgLines = doc.splitTextToSize(alert.message, usableWidth)
          doc.text(msgLines, marginLeft, y)
          y += msgLines.length * lineHeight
        }
        y += 10
      })
      if (data.alertHistory.length > 30) {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(`... and ${data.alertHistory.length - 30} more entries`, marginLeft, y)
        y += lineHeight
      }
      y += 20
    }

    // Trigger Configuration
    if (data.triggerConfiguration) {
      addPageIfNeeded(80)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Trigger Configuration", marginLeft, y)
      y += 20
      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      
      const configData = [
        ["Trigger ID", data.triggerConfiguration.triggerid || ""],
        ["Description", data.triggerConfiguration.description || ""],
        ["Expression", data.triggerConfiguration.expression || ""],
        ["Priority", severityLabels[data.triggerConfiguration.priority || 0]],
        ["Status", data.triggerConfiguration.status || ""]
      ]

      configData.forEach(([label, value]) => {
        addPageIfNeeded()
        doc.setFont(undefined, "bold")
        doc.text(label + ":", marginLeft, y)
        doc.setFont(undefined, "normal")
        const textLines = doc.splitTextToSize(String(value), usableWidth * 0.7)
        doc.text(textLines, marginLeft + 100, y)
        y += Math.max(lineHeight, textLines.length * lineHeight)
      })
      y += 20
    }

    // Patterns
    if (data.patterns) {
      addPageIfNeeded(80)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Patterns & Analysis", marginLeft, y)
      y += 20
      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      
      const patternsData = [
        ["Frequency Trend", data.patterns.frequency || "stable"],
        ["Average Time Between Occurrences", formatDuration(data.patterns.averageTimeBetweenOccurrences)],
        ["Typical Severity", severityLabels[data.patterns.typicalSeverity || 0]],
        ["Typical Resolution Time", formatDuration(data.patterns.typicalResolutionTime)],
        ["Requires Manual Intervention", data.patterns.requiresManualIntervention ? "Yes" : "No"]
      ]

      patternsData.forEach(([label, value]) => {
        addPageIfNeeded()
        doc.setFont(undefined, "bold")
        doc.text(label + ":", marginLeft, y)
        doc.setFont(undefined, "normal")
        doc.text(String(value), marginLeft + 200, y)
        y += lineHeight
      })
      y += 20
    }

    // Correlated Events (limit to 5 for export)
    if (data.correlatedEvents && data.correlatedEvents.length > 0) {
      addPageIfNeeded(60)
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text("Correlated Events", marginLeft, y)
      y += 20
      doc.setFontSize(9)
      doc.setFont(undefined, "bold")
      doc.text("Timestamp", marginLeft, y)
      doc.text("Name", marginLeft + 150, y)
      doc.text("Severity", marginLeft + 300, y)
      y += 15
      doc.setFont(undefined, "normal")
      
      data.correlatedEvents.slice(0, 5).forEach((event) => {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(formatTimestamp(event.clock), marginLeft, y)
        const nameLines = doc.splitTextToSize(event.name || "", 140)
        doc.text(nameLines, marginLeft + 150, y)
        doc.text(severityLabels[event.severity || 0], marginLeft + 300, y)
        y += Math.max(lineHeight, nameLines.length * lineHeight)
      })
      if (data.correlatedEvents.length > 5) {
        addPageIfNeeded()
        doc.setFontSize(8)
        doc.text(`... and ${data.correlatedEvents.length - 5} more events`, marginLeft, y)
        y += lineHeight
      }
    }

    const pdfBlob = doc.output("blob")
    const ts = filenameSuffix()
    downloadBlob(pdfBlob, `event-${eventId}-export-${ts}.pdf`)
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

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading event history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error || "Failed to load event history"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { problemDetails, lifecycle, eventTimeline, acknowledgmentHistory, metricHistory, severityTimeline, alertHistory, triggerConfiguration, patterns, correlatedEvents } = data

  return (
    <>
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Problem Event Details</h1>
          <p className="text-sm text-muted-foreground">Event ID: {eventId}</p>
        </div>
        <Button 
          size="sm"
          className="bg-[#5771d7] hover:bg-[#495fc0] text-white font-bold gap-2 border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => setExportOpen(true)}
          aria-label="Open export options dialog"
        >
          <Download className="h-4 w-4" strokeWidth={3} />
          Export
        </Button>
      </div>

      {/* Problem Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Problem Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Host Name</p>
              <p className="font-semibold">{getHostName()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Problem Name</p>
              <p className="font-semibold">{problemDetails?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Severity</p>
              <span className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                severityColors[problemDetails?.severity || 0],
                "text-white"
              )}>
                {severityLabels[problemDetails?.severity || 0]}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={cn(
                "font-semibold",
                lifecycle?.isResolved ? "text-green-600" : "text-red-600"
              )}>
                {lifecycle?.isResolved ? "Resolved" : "Active"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">First Occurrence</p>
              <p className="font-semibold">{formatTimestamp(lifecycle?.firstOccurrence)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Duration</p>
              <p className="font-semibold">{formatDuration(lifecycle?.currentDuration)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Occurrences</p>
              <p className="font-semibold">{lifecycle?.totalOccurrences || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Severity Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Severity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeverityGraph 
            severityTimeline={severityTimeline || []}
            metricHistory={metricHistory || []}
            eventTimeline={eventTimeline || []}
          />
        </CardContent>
      </Card>

      {/* Lifecycle Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lifecycle Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Average Duration</p>
              <p className="text-2xl font-bold">{formatDuration(lifecycle?.averageDuration)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Occurrences</p>
              <p className="text-2xl font-bold">{lifecycle?.totalOccurrences || 0}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Current Duration</p>
              <p className="text-2xl font-bold">{formatDuration(lifecycle?.currentDuration)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Resolved</p>
              <p className="text-2xl font-bold">{lifecycle?.isResolved ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eventTimeline?.map((event, index) => (
              <div key={event.eventid || index} className="flex items-start gap-4 p-3 border rounded-lg">
                <div className={cn(
                  "w-3 h-3 rounded-full mt-2",
                  event.value === "1" ? "bg-red-500" : "bg-green-500"
                )} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{event.name || "Event"}</span>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      severityColors[event.severity || 0],
                      "text-white"
                    )}>
                      {severityLabels[event.severity || 0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(event.clock)}
                    </span>
                  </div>
                  {event.hosts && event.hosts.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Host: {event.hosts.map(h => h.name).join(", ")}
                    </p>
                  )}
                  {event.acknowledges && event.acknowledges.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {event.acknowledges.length} acknowledgment(s)
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acknowledgment History */}
{acknowledgmentHistory && acknowledgmentHistory.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Acknowledgment History
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {acknowledgmentHistory.map((ack, index) => {
          // Format username properly - handle "uptimex" -> "UptimeX"
          const getDisplayName = () => {
            if (ack.fullName) {
              return ack.fullName;
            }
            if (ack.username) {
              // Check if username is "uptimex" (case-insensitive) and format it as "UptimeX"
              if (ack.username.toLowerCase() === 'uptimex') {
                return 'UptimeX';
              }
              return ack.username;
            }
            if (ack.userid) {
              return ack.userid;
            }
            // Fallback to "Inactive User" if no username/userid is found
            return 'Inactive User';
          };

          const displayName = getDisplayName();

          return (
            <div key={ack.acknowledgeid || index} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">
                    Acknowledged by {displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimestamp(ack.clock)}
                  </p>
                </div>
              </div>
              {ack.message && (
                <p className="text-sm mt-2">{ack.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Event: {ack.eventName || "N/A"}
              </p>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
)}

      {/* Metric History */}
      {metricHistory && metricHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Metric Value History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold border-b pb-2">
                <div>Timestamp</div>
                <div>Item</div>
                <div>Value</div>
                <div>Key</div>
              </div>
              {metricHistory.slice(0, 100).map((metric, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 text-sm py-2 border-b">
                  <div className="text-muted-foreground">{formatTimestamp(metric.clock)}</div>
                  <div>{metric.itemName || "N/A"}</div>
                  <div className="font-mono">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.itemKey || "N/A"}</div>
                </div>
              ))}
              {metricHistory.length > 100 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Showing first 100 of {metricHistory.length} data points
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert History */}
      {alertHistory && alertHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertHistory.map((alert, index) => (
                <div key={alert.alertid || index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{alert.subject || "Alert"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(alert.clock)}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      alert.status === "1" ? "bg-green-500" : "bg-red-500",
                      "text-white"
                    )}>
                      {alert.status === "1" ? "Sent" : "Failed"}
                    </span>
                  </div>
                  {alert.sendto && (
                    <p className="text-sm text-muted-foreground">To: {alert.sendto}</p>
                  )}
                  {alert.message && (
                    <p className="text-sm mt-2">{alert.message}</p>
                  )}
                  {alert.error && (
                    <p className="text-xs text-red-600 mt-2">Error: {alert.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trigger Configuration */}
      {triggerConfiguration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Trigger Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="font-semibold">{triggerConfiguration.description || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Expression</p>
              <p className="font-mono text-sm bg-muted p-2 rounded">{triggerConfiguration.expression || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Priority</p>
              <span className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                severityColors[triggerConfiguration.priority || 0],
                "text-white"
              )}>
                {severityLabels[triggerConfiguration.priority || 0]}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patterns */}
      {patterns && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Patterns & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frequency Trend</p>
                <p className="font-semibold capitalize">{patterns.frequency || "stable"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Time Between Occurrences</p>
                <p className="font-semibold">{formatDuration(patterns.averageTimeBetweenOccurrences)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Typical Severity</p>
                <span className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                  severityColors[patterns.typicalSeverity || 0],
                  "text-white"
                )}>
                  {severityLabels[patterns.typicalSeverity || 0]}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Typical Resolution Time</p>
                <p className="font-semibold">{formatDuration(patterns.typicalResolutionTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Requires Manual Intervention</p>
                <p className="font-semibold">{patterns.requiresManualIntervention ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correlated Events */}
      {correlatedEvents && correlatedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Correlated Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {correlatedEvents.slice(0, 5).map((event, index) => (
                <div key={event.eventid || index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{event.name || "Event"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(event.clock)}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      severityColors[event.severity || 0],
                      "text-white"
                    )}>
                      {severityLabels[event.severity || 0]}
                    </span>
                  </div>
                </div>
              ))}
              {correlatedEvents.length > 5 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Showing 5 of {correlatedEvents.length} correlated events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
      <DialogContent aria-label="Export options" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Event Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <label htmlFor="export-pdf" className="flex-1 text-sm font-medium text-foreground">
              PDF (Complete Event Details)
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
              CSV (Complete Event Details)
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