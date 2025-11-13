"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, AlertTriangle, Activity, CheckCircle2, TrendingUp, Users, Bell, Settings, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Problem Event Details</h1>
          <p className="text-sm text-muted-foreground">Event ID: {eventId}</p>
        </div>
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
              {acknowledgmentHistory.map((ack, index) => (
                <div key={ack.acknowledgeid || index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">User ID: {ack.userid || "Unknown"}</p>
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
              ))}
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
              {correlatedEvents.map((event, index) => (
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}