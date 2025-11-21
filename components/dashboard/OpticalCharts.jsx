"use client"

import dynamic from 'next/dynamic'
import { useMemo, useCallback } from 'react'
import { useTheme } from 'next-themes'
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

export default function OpticalCharts({ chartRefs = {}, chartInstanceRefs = {} }) {
  const { resolvedTheme } = useTheme()
  const sectors = [1, 2, 3]
  // Use individual selectors to avoid creating new objects on every render
  const dateFrom = useTimeframeFilterStore((state) => state.dateFrom)
  const dateTo = useTimeframeFilterStore((state) => state.dateTo)
  const timeFrom = useTimeframeFilterStore((state) => state.timeFrom)
  const timeTo = useTimeframeFilterStore((state) => state.timeTo)
  
  const handleChartMount = useCallback(
    (refKey, component) => {
      if (component?.chart && chartInstanceRefs?.[refKey]) {
        chartInstanceRefs[refKey].current = component.chart
      }
    },
    [chartInstanceRefs]
  )

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

  const makeResampler = useMemo(() => {
    const toMinutes = (t) => {
      const [h, m] = String(t).split(':').map(Number)
      return (h || 0) * 60 + (m || 0)
    }
    const toLabel = (min) => `${String(Math.floor(min / 60)).padStart(2,'0')}:${String(min % 60).padStart(2,'0')}`
    return (data, key) => {
      if (!Array.isArray(data) || data.length === 0) return []
      const map = new Map()
      data.forEach(p => map.set(String(p.time), p[key] ?? null))
      const start = dateFrom === dateTo ? timeFrom : '00:00'
      const end = dateFrom === dateTo ? timeTo : '23:45'
      const startMin = toMinutes(start)
      const endMin = toMinutes(end)
      let last = null
      const out = []
      for (let m = startMin; m <= endMin; m += 15) {
        const label = toLabel(m)
        let val = map.has(label) ? map.get(label) : null
        if (val === null && last !== null) val = last
        if (val !== null) last = val
        out.push({ time: label, [key]: val })
      }
      return out
    }
  }, [dateFrom, dateTo, timeFrom, timeTo])

  const baseOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        foreColor: (() => {
          const v = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()
          return `hsl(${v})`
        })(),
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
      markers: {
        size: 2,
        strokeWidth: 2,
        strokeColors: (() => {
          const v = getComputedStyle(document.documentElement).getPropertyValue('--card').trim()
          return `hsl(${v})`
        })(),
      },
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
      grid: {
        borderColor: (() => {
          const v = getComputedStyle(document.documentElement).getPropertyValue('--border').trim()
          return `hsl(${v})`
        })(),
      },
      tooltip: {
        x: { format: 'HH:mm' },
      },
    }),
    [resolvedTheme]
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
  <Card key={`pd-${sector}`} ref={chartRefs[`pdSector${sector}`]}>
    <CardHeader>
      <CardTitle>Sector {sector} RU{sector} PD Level</CardTitle>
    </CardHeader>
    <CardContent>
      <ReactApexChart
        ref={(component) => handleChartMount(`pdSector${sector}`, component)}
        options={buildOptions('#22c55e', 'V')}
        series={[
          {
            name: `Sector ${sector} PD Level`,
            data: createSeries(makeResampler(filteredPdData, `sector${sector}`), `sector${sector}`),
          },
        ]}
        type="line"
        height={200}
      />
    </CardContent>
  </Card>
))}

{sectors.map((sector) => (
  <Card key={`ld-${sector}`} ref={chartRefs[`ldSector${sector}`]}>
    <CardHeader>
      <CardTitle>Sector {sector} RU{sector} LD Level</CardTitle>
    </CardHeader>
    <CardContent>
      <ReactApexChart
        ref={(component) => handleChartMount(`ldSector${sector}`, component)}
        options={buildOptions('#a78bfa', 'mA')}
        series={[
          {
            name: `Sector ${sector} LD Level`,
            data: createSeries(makeResampler(filteredLdData, `sector${sector}`), `sector${sector}`),
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
