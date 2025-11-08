"use client"

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const pdData = [
  { time: '00:00', sector1: 1.6, sector2: 3.1, sector3: 0 },
  { time: '03:00', sector1: 1.62, sector2: 3.1, sector3: 0 },
  { time: '06:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '09:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '12:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '15:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '18:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '21:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
]

const ldData = [
  { time: '00:00', sector1: 6.65, sector2: 6.6, sector3: 6.6 },
  { time: '03:00', sector1: 6.66, sector2: 6.7, sector3: 6.7 },
  { time: '06:00', sector1: 6.67, sector2: 6.62, sector3: 6.65 },
  { time: '09:00', sector1: 6.7, sector2: 6.64, sector3: 6.68 },
  { time: '12:00', sector1: 6.72, sector2: 6.66, sector3: 6.63 },
  { time: '15:00', sector1: 6.69, sector2: 6.6, sector3: 6.61 },
  { time: '18:00', sector1: 6.68, sector2: 6.62, sector3: 6.6 },
  { time: '21:00', sector1: 6.8, sector2: 6.7, sector3: 6.75 },
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

export default function OpticalCharts() {
  const sectors = [1, 2, 3]
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

  const filteredPdData = useMemo(() => filterDataByTimeframe(pdData), [filterDataByTimeframe])
  const filteredLdData = useMemo(() => filterDataByTimeframe(ldData), [filterDataByTimeframe])

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {sectors.map((sector) => (
        <Card key={`pd-${sector}`}>
          <CardHeader>
            <CardTitle>Sector {sector} RU{sector} PD Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactApexChart
              options={buildOptions('#22c55e', 'V')}
              series={[
                {
                  name: `Sector ${sector} PD Level`,
                  data: createSeries(filteredPdData, `sector${sector}`),
                },
              ]}
              type="line"
              height={200}
            />
          </CardContent>
        </Card>
      ))}

      {sectors.map((sector) => (
        <Card key={`ld-${sector}`}>
          <CardHeader>
            <CardTitle>Sector {sector} RU{sector} LD Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactApexChart
              options={buildOptions('#a78bfa', 'mA')}
              series={[
                {
                  name: `Sector ${sector} LD Level`,
                  data: createSeries(filteredLdData, `sector${sector}`),
                },
              ]}
              type="line"
              height={200}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
