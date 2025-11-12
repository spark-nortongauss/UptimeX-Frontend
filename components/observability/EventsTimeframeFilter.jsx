"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Calendar, Search, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useEventsTimeframeStore } from "@/lib/stores/eventsTimeframeStore"

const QUICK_RANGES = [
  { label: "Last 1 day", value: 1 * 24 * 60 * 60 * 1000 },
  { label: "Last 2 days", value: 2 * 24 * 60 * 60 * 1000 },
  { label: "Last 10 days", value: 10 * 24 * 60 * 60 * 1000 },
  { label: "Last 15 days", value: 15 * 24 * 60 * 60 * 1000 },
  { label: "Last 1 month", value: 30 * 24 * 60 * 60 * 1000 },
  { label: "Last 4 months", value: 4 * 30 * 24 * 60 * 60 * 1000 },
  { label: "Last 6 months", value: 6 * 30 * 24 * 60 * 60 * 1000 },
  { label: "Last 1 year", value: 365 * 24 * 60 * 60 * 1000 },
]

export default function EventsTimeframeFilter() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const mode = useEventsTimeframeStore((state) => state.mode)
  const dateFrom = useEventsTimeframeStore((state) => state.dateFrom)
  const timeFrom = useEventsTimeframeStore((state) => state.timeFrom)
  const dateTo = useEventsTimeframeStore((state) => state.dateTo)
  const timeTo = useEventsTimeframeStore((state) => state.timeTo)
  const recentlyUsed = useEventsTimeframeStore((state) => state.recentlyUsedRanges)
  const setAbsoluteRange = useEventsTimeframeStore((state) => state.setAbsoluteRange)
  const applyQuickRange = useEventsTimeframeStore((state) => state.applyQuickRange)
  const setAllTime = useEventsTimeframeStore((state) => state.setAllTime)

  const [draftFrom, setDraftFrom] = useState(
    mode === "range" && dateFrom && timeFrom ? `${dateFrom}T${timeFrom}` : ""
  )
  const [draftTo, setDraftTo] = useState(
    mode === "range" && dateTo && timeTo ? `${dateTo}T${timeTo}` : ""
  )

  useEffect(() => {
    if (mode === "range" && dateFrom && timeFrom) {
      setDraftFrom(`${dateFrom}T${timeFrom}`)
    } else {
      setDraftFrom("")
    }
    if (mode === "range" && dateTo && timeTo) {
      setDraftTo(`${dateTo}T${timeTo}`)
    } else {
      setDraftTo("")
    }
  }, [mode, dateFrom, timeFrom, dateTo, timeTo])

  const currentLabel =
    mode === "range"
      ? `${dateFrom} ${timeFrom} → ${dateTo} ${timeTo}`
      : "All time events"

  const filteredQuickRanges = QUICK_RANGES.filter((range) =>
    range.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAbsoluteChange = (type, value) => {
    if (type === "from") {
      setDraftFrom(value)
    } else {
      setDraftTo(value)
    }
  }

  const handleApply = () => {
    if (!draftFrom || !draftTo) return
    const [fromDate, fromTime] = draftFrom.split("T")
    const [toDate, toTime] = draftTo.split("T")
    setAbsoluteRange({ dateFrom: fromDate, timeFrom: fromTime, dateTo: toDate, timeTo: toTime })
    setIsExpanded(false)
  }

  const handleSetAllTime = () => {
    setAllTime()
    setDraftFrom("")
    setDraftTo("")
    setIsExpanded(false)
  }

  return (
    <Card className="bg-background border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="rounded-md p-1.5 hover:bg-accent transition-colors"
              aria-label={isExpanded ? "Collapse time range" : "Expand time range"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold leading-none">{currentLabel}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetAllTime}
              className={cn(
                "flex items-center gap-2 text-xs uppercase tracking-wide",
                mode === "all" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              All time
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-xs font-medium"
            >
              Adjust range
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Absolute time range</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <button
                    onClick={() => {
                      if (mode !== "range" || !dateFrom || !timeFrom || !dateTo || !timeTo) return
                      const start = new Date(`${dateFrom}T${timeFrom}`)
                      const end = new Date(`${dateTo}T${timeTo}`)
                      const duration = end.getTime() - start.getTime()
                      const newStart = new Date(start.getTime() - duration)
                      const newEnd = new Date(end.getTime() - duration)
                      setAbsoluteRange({
                        dateFrom: newStart.toISOString().split("T")[0],
                        timeFrom: newStart.toTimeString().slice(0, 5),
                        dateTo: newEnd.toISOString().split("T")[0],
                        timeTo: newEnd.toTimeString().slice(0, 5),
                      })
                    }}
                    className="rounded-md p-1 hover:bg-accent transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (mode !== "range" || !dateFrom || !timeFrom || !dateTo || !timeTo) return
                      const start = new Date(`${dateFrom}T${timeFrom}`)
                      const end = new Date(`${dateTo}T${timeTo}`)
                      const duration = end.getTime() - start.getTime()
                      const newStart = new Date(start.getTime() + duration)
                      const newEnd = new Date(end.getTime() + duration)
                      setAbsoluteRange({
                        dateFrom: newStart.toISOString().split("T")[0],
                        timeFrom: newStart.toTimeString().slice(0, 5),
                        dateTo: newEnd.toISOString().split("T")[0],
                        timeTo: newEnd.toTimeString().slice(0, 5),
                      })
                    }}
                    className="rounded-md p-1 hover:bg-accent transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="events-from" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <div className="relative">
                    <Input
                      id="events-from"
                      type="datetime-local"
                      value={draftFrom}
                      onChange={(event) => handleAbsoluteChange("from", event.target.value)}
                      className="bg-background pr-10 text-foreground placeholder:text-muted-foreground"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="events-to" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <div className="relative">
                    <Input
                      id="events-to"
                      type="datetime-local"
                      value={draftTo}
                      onChange={(event) => handleAbsoluteChange("to", event.target.value)}
                      className="bg-background pr-10 text-foreground placeholder:text-muted-foreground"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleApply}
                  className="w-40"
                  disabled={!draftFrom || !draftTo}
                >
                  Apply time range
                </Button>
                <Button variant="outline" onClick={handleSetAllTime} className="w-28">
                  Clear
                </Button>
              </div>

              {recentlyUsed.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <h4 className="text-xs font-medium text-muted-foreground">Recently used ranges</h4>
                  <div className="space-y-1">
                    {recentlyUsed.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => {
                          setAbsoluteRange({
                            dateFrom: range.dateFrom,
                            timeFrom: range.timeFrom,
                            dateTo: range.dateTo,
                            timeTo: range.timeTo,
                          })
                          setDraftFrom(`${range.dateFrom}T${range.timeFrom}`)
                          setDraftTo(`${range.dateTo}T${range.timeTo}`)
                        }}
                        className="w-full rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
                      >
                        {range.dateFrom} {range.timeFrom} → {range.dateTo} {range.timeTo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Quick ranges</h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quick ranges"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border/60 p-2">
                {filteredQuickRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      const newRange = applyQuickRange(range.value)
                      if (newRange) {
                        setDraftFrom(`${newRange.dateFrom}T${newRange.timeFrom}`)
                        setDraftTo(`${newRange.dateTo}T${newRange.timeTo}`)
                      }
                      setIsExpanded(false)
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

