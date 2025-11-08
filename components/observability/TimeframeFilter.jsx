"use client"

import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TimeframeFilter() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeframe Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full"
              min={dateFrom}
            />
          </div>

          {/* Time From */}
          <div className="space-y-2">
            <Label htmlFor="timeFrom">Time From</Label>
            <Input
              id="timeFrom"
              type="time"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Time To */}
          <div className="space-y-2">
            <Label htmlFor="timeTo">Time To</Label>
            <Input
              id="timeTo"
              type="time"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={reset}>
            Reset to Last 24 Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

