"use client"

import { useState, useEffect } from 'react'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Clock, ChevronDown, ChevronUp, Calendar, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TimeframeFilter() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentlyUsed, setRecentlyUsed] = useState([
    { from: '2025-08-07 00:00:00', to: '2025-08-11 23:59:59' },
    { from: '2025-11-01 00:00:00', to: '2025-11-08 23:59:59' }
  ])

  const {
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
    setDateFrom,
    setDateTo,
    setTimeFrom,
    setTimeTo,
    reset,
  } = useTimeframeFilterStore()

  // Format datetime for display
  const formatDateTime = (date, time) => {
    return `${date} ${time}`
  }

  // Get current timeframe display
  const currentTimeframe = `${formatDateTime(dateFrom, timeFrom)} to ${formatDateTime(dateTo, timeTo)}`

  // Quick range options
  const quickRanges = [
    { label: 'Last 5 minutes', value: 5 * 60 * 1000 },
    { label: 'Last 15 minutes', value: 15 * 60 * 1000 },
    { label: 'Last 30 minutes', value: 30 * 60 * 1000 },
    { label: 'Last 1 hour', value: 60 * 60 * 1000 },
    { label: 'Last 3 hours', value: 3 * 60 * 60 * 1000 },
    { label: 'Last 6 hours', value: 6 * 60 * 60 * 1000 },
    { label: 'Last 12 hours', value: 12 * 60 * 60 * 1000 },
    { label: 'Last 24 hours', value: 24 * 60 * 60 * 1000 },
    { label: 'Last 2 days', value: 2 * 24 * 60 * 60 * 1000 },
  ]

  // Filter quick ranges based on search
  const filteredQuickRanges = quickRanges.filter(range =>
    range.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle quick range selection
  const handleQuickRange = (milliseconds) => {
    const now = new Date()
    const from = new Date(now.getTime() - milliseconds)
    
    setDateFrom(from.toISOString().split('T')[0])
    setTimeFrom(from.toTimeString().slice(0, 5))
    setDateTo(now.toISOString().split('T')[0])
    setTimeTo(now.toTimeString().slice(0, 5))
    
    // Add to recently used
    const newRange = {
      from: formatDateTime(from.toISOString().split('T')[0], from.toTimeString().slice(0, 5)),
      to: formatDateTime(now.toISOString().split('T')[0], now.toTimeString().slice(0, 5))
    }
    setRecentlyUsed(prev => [newRange, ...prev.slice(0, 4)])
    
    setIsExpanded(false)
  }

  // Handle apply time range
  const handleApply = () => {
    // Add current range to recently used
    const newRange = {
      from: formatDateTime(dateFrom, timeFrom),
      to: formatDateTime(dateTo, timeTo)
    }
    setRecentlyUsed(prev => [newRange, ...prev.slice(0, 4)])
    setIsExpanded(false)
  }

  // Handle preset button clicks
  const handlePreset = (type) => {
    if (type === 'back') {
      // Go back 24 hours
      const currentFrom = new Date(`${dateFrom}T${timeFrom}`)
      const currentTo = new Date(`${dateTo}T${timeTo}`)
      const duration = currentTo - currentFrom
      
      const newFrom = new Date(currentFrom.getTime() - duration)
      const newTo = new Date(currentTo.getTime() - duration)
      
      setDateFrom(newFrom.toISOString().split('T')[0])
      setTimeFrom(newFrom.toTimeString().slice(0, 5))
      setDateTo(newTo.toISOString().split('T')[0])
      setTimeTo(newTo.toTimeString().slice(0, 5))
    } else if (type === 'forward') {
      // Go forward 24 hours
      const currentFrom = new Date(`${dateFrom}T${timeFrom}`)
      const currentTo = new Date(`${dateTo}T${timeTo}`)
      const duration = currentTo - currentFrom
      
      const newFrom = new Date(currentFrom.getTime() + duration)
      const newTo = new Date(currentTo.getTime() + duration)
      
      setDateFrom(newFrom.toISOString().split('T')[0])
      setTimeFrom(newFrom.toTimeString().slice(0, 5))
      setDateTo(newTo.toISOString().split('T')[0])
      setTimeTo(newTo.toTimeString().slice(0, 5))
    }
  }

  if (!isExpanded) {
    return (
      <div className="bg-background border rounded-lg shadow-sm">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {currentTimeframe}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    )
  }

  return (
    <Card className="bg-background border border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-accent rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Time Range</CardTitle>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Absolute Time Range */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Absolute time range</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="from-datetime" className="text-xs text-muted-foreground">From</Label>
                <div className="relative">
                  <Input
                    id="from-datetime"
                    type="datetime-local"
                    value={`${dateFrom}T${timeFrom}`}
                    onChange={(e) => {
                      const [date, time] = e.target.value.split('T')
                      setDateFrom(date)
                      setTimeFrom(time)
                    }}
                    className="pr-10 bg-background text-foreground placeholder:text-muted-foreground border-border"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="to-datetime" className="text-xs text-muted-foreground">To</Label>
                <div className="relative">
                  <Input
                    id="to-datetime"
                    type="datetime-local"
                    value={`${dateTo}T${timeTo}`}
                    onChange={(e) => {
                      const [date, time] = e.target.value.split('T')
                      setDateTo(date)
                      setTimeTo(time)
                    }}
                    className="pr-10 bg-background text-foreground placeholder:text-muted-foreground border-border"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleApply}
                className="w-36 font-bold bg-[#5771d7] hover:bg-[#4c64c1] text-white shadow-sm hover:shadow-md transition-colors"
              >
                Apply time range
              </Button>
            </div>
            
            {recentlyUsed.length > 0 && (
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Recently used absolute ranges</h4>
                <div className="space-y-1">
                  {recentlyUsed.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const [fromDate, fromTime] = range.from.split(' ')
                        const [toDate, toTime] = range.to.split(' ')
                        setDateFrom(fromDate)
                        setTimeFrom(fromTime)
                        setDateTo(toDate)
                        setTimeTo(toTime)
                      }}
                      className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded hover:bg-accent/50 transition-colors"
                    >
                      {range.from} to {range.to}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Browser Time</span>
                <span className="px-2 py-1 bg-muted rounded text-muted-foreground">UTC+01:00</span>
              </div>
              <button className="text-[#5771d7] hover:text-[#4c64c1] mt-1">
                Change time settings
              </button>
            </div>
          </div>
          
          {/* Right Column - Quick Ranges */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick ranges</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quick ranges"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background text-foreground placeholder:text-muted-foreground border-border"
              />
            </div>
            
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredQuickRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleQuickRange(range.value)}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            <div className="pt-3 border-t border-border">
              <Button
                variant="outline"
                onClick={reset}
                className="w-full"
              >
                Reset to Last 24 Hours
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

