"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
// Using native Date methods instead of date-fns

const severityLabels = {
  0: "Not classified",
  1: "Information",
  2: "Warning",
  3: "Average",
  4: "High",
  5: "Disaster"
}

const severityColors = {
  0: "#6B7280", // gray
  1: "#3B82F6", // blue
  2: "#EAB308", // yellow
  3: "#F97316", // orange
  4: "#EF4444", // red
  5: "#A855F7", // purple
}

export default function SeverityGraph({ severityTimeline, metricHistory, eventTimeline }) {
  // Prepare severity data for the chart
  const severityData = useMemo(() => {
    if (!severityTimeline || severityTimeline.length === 0) return []

    return severityTimeline.map((item) => ({
      timestamp: item.timestamp * 1000, // Convert to milliseconds
      severity: item.severity,
      date: new Date(item.timestamp * 1000),
      acknowledged: item.acknowledged,
    }))
  }, [severityTimeline])

  // Prepare event markers
  const eventMarkers = useMemo(() => {
    if (!eventTimeline || eventTimeline.length === 0) return []

    return eventTimeline
      .filter((e) => e.value === "1") // Only PROBLEM events
      .map((e) => ({
        timestamp: e.clock * 1000,
        severity: e.severity,
        name: e.name,
        date: new Date(e.clock * 1000),
      }))
  }, [eventTimeline])

  // Format timestamp for tooltip
  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`
  }

  // Format date for X-axis
  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[date.getMonth()]
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${month} ${day} ${hours}:${minutes}`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-2">{formatTime(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === "severity" && ` (${severityLabels[entry.value] || "Unknown"})`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (severityData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        <p>No data available for visualization</p>
      </div>
    )
  }

  // Combine all timestamps for X-axis range
  const allTimestamps = [
    ...severityData.map((d) => d.timestamp),
    ...eventMarkers.map((e) => e.timestamp),
  ]

  const minTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : Date.now()
  const maxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : Date.now()

  return (
    <div className="space-y-6">
      {/* Severity Over Time Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Severity Level Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={severityData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={[minTime, maxTime]}
              tickFormatter={(value) => formatDate(value)}
              className="text-xs"
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => severityLabels[value] || value}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="stepAfter"
              dataKey="severity"
              name="Severity"
              stroke={severityColors[4]}
              strokeWidth={2}
              dot={{ r: 4, fill: severityColors[4] }}
              activeDot={{ r: 6 }}
            />
            {/* Mark acknowledged events */}
            {severityData
              .filter((d) => d.acknowledged)
              .map((d, index) => (
                <ReferenceLine
                  key={`ack-${index}`}
                  x={d.timestamp}
                  stroke="#3B82F6"
                  strokeDasharray="5 5"
                  label={{ value: "Ack", position: "top" }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}