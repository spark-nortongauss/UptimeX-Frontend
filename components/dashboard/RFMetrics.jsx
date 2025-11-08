"use client"

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const rfTxData = [
  { time: '00:00', sector1: 34.6, sector2: 34.2, sector3: 33.2 },
  { time: '03:00', sector1: 34.9, sector2: 34.9, sector3: 33.6 },
  { time: '06:00', sector1: 34.7, sector2: 35.0, sector3: 33.8 },
  { time: '09:00', sector1: 34.5, sector2: 34.5, sector3: 33.3 },
  { time: '12:00', sector1: 35.1, sector2: 35.2, sector3: 33.9 },
  { time: '15:00', sector1: 34.8, sector2: 34.7, sector3: 34.1 },
  { time: '18:00', sector1: 34.9, sector2: 34.8, sector3: 33.7 },
  { time: '21:00', sector1: 35.2, sector2: 35.1, sector3: 33.4 },
]

const rfRxData = [
  { time: '00:00', sector1: 46, sector2: 45.5, sector3: 46.2 },
  { time: '03:00', sector1: 45.5, sector2: 46.2, sector3: 45.7 },
  { time: '06:00', sector1: 46.2, sector2: 45.7, sector3: 46.8 },
  { time: '09:00', sector1: 45.7, sector2: 46.8, sector3: 46.1 },
  { time: '12:00', sector1: 46.8, sector2: 46.1, sector3: 45.9 },
  { time: '15:00', sector1: 46.1, sector2: 45.9, sector3: 46.4 },
  { time: '18:00', sector1: 45.9, sector2: 46.4, sector3: 46.0 },
  { time: '21:00', sector1: 46.4, sector2: 46.0, sector3: 45.8 },
]

const sectorData = [
  { avg: 34.9, sector: 1 },
  { avg: 35.0, sector: 2 },
  { avg: 33.4, sector: 3 }
]

const parseTimeToMillis = (time) => {
  const [hours, minutes] = String(time).split(':').map(Number)
  if (Number.isNaN(hours)) return undefined
  return Date.UTC(1970, 0, 1, hours, minutes || 0)
}

const createSeries = (data, key) =>
  data.map((point) => ({
    x: parseTimeToMillis(point.time),
    y: point[key] ?? null,
  }))

export default function RFMetrics() {
  // Use individual selectors to avoid creating new objects on every render
  const dateFrom = useTimeframeFilterStore((state) => state.dateFrom)
  const dateTo = useTimeframeFilterStore((state) => state.dateTo)
  const timeFrom = useTimeframeFilterStore((state) => state.timeFrom)
  const timeTo = useTimeframeFilterStore((state) => state.timeTo)

  // Filter data based on timeframe
  const filterDataByTimeframe = useMemo(() => {
    return (data) => {
      return data.filter((point) => {
        const pointTime = point.time
        if (!pointTime) return false
        
        // Check if time is within the time range
        // For same date range, check both time bounds
        if (dateFrom === dateTo) {
          return pointTime >= timeFrom && pointTime <= timeTo
        }
        
        // For different dates, include all times (they represent data points across the date range)
        return true
      })
    }
  }, [dateFrom, dateTo, timeFrom, timeTo])

  const filteredRfTxData = useMemo(() => filterDataByTimeframe(rfTxData), [filterDataByTimeframe])
  const filteredRfRxData = useMemo(() => filterDataByTimeframe(rfRxData), [filterDataByTimeframe])

  const baseOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true,
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 2 },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
          datetimeFormatter: {
            hour: 'HH:mm',
            minute: 'HH:mm',
          },
        },
      },
      grid: { borderColor: '#e5e7eb' },
      tooltip: {
        x: { format: 'HH:mm' },
      },
    }),
    []
  )

  const buildOptions = useMemo(
    () =>
      (color, yTitle) => ({
        ...baseOptions,
        chart: { ...baseOptions.chart },
        dataLabels: { ...baseOptions.dataLabels },
        stroke: { ...baseOptions.stroke },
        markers: { ...baseOptions.markers },
        xaxis: { ...baseOptions.xaxis },
        grid: { ...baseOptions.grid },
        tooltip: { ...baseOptions.tooltip },
        colors: [color],
        yaxis: {
          title: { text: yTitle },
        },
      }),
    [baseOptions]
  )

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {sectorData.map((sector) => {
        const txSeries = [
          {
            name: `Sector ${sector.sector} MU RF TX IN`,
            data: createSeries(filteredRfTxData, `sector${sector.sector}`),
          },
        ]
        const rxSeries = [
          {
            name: `Sector ${sector.sector} RU RX Out`,
            data: createSeries(filteredRfRxData, `sector${sector.sector}`),
          },
        ]

        return (
          <div key={sector.sector} className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">
                  Avg. Sector {sector.sector} RF TX IN Power
                </div>
                <div className="mt-1 text-4xl font-extrabold">
                  {sector.avg} dBm
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector {sector.sector} MU RF TX IN</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={buildOptions('#eab308', 'dBm')}
                  series={txSeries}
                  type="line"
                  height={220}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector {sector.sector} RU RX Out</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={buildOptions('#60a5fa', 'dBm')}
                  series={rxSeries}
                  type="line"
                  height={220}
                />
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
