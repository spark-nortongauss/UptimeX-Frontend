"use client"

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const icmpData = [
  { time: '00:00', status: 1 },
  { time: '03:00', status: 1 },
  { time: '06:00', status: 1 },
  { time: '09:00', status: 1 },
  { time: '12:00', status: 1 },
  { time: '15:00', status: 1 },
  { time: '18:00', status: 1 },
  { time: '21:00', status: 1 },
]

const latencyData = [
  { time: '00:00', latency: 182 },
  { time: '03:00', latency: 180 },
  { time: '06:00', latency: 185 },
  { time: '09:00', latency: 170 },
  { time: '12:00', latency: 182 },
  { time: '15:00', latency: 181 },
  { time: '18:00', latency: 176 },
  { time: '21:00', latency: 185 },
]

const lossData = [
  { time: '00:00', loss: 0 },
  { time: '03:00', loss: 0 },
  { time: '06:00', loss: 1 },
  { time: '09:00', loss: 0 },
  { time: '12:00', loss: 0 },
  { time: '15:00', loss: 0 },
  { time: '18:00', loss: 1 },
  { time: '21:00', loss: 0 },
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

export default function NetworkConnectivityCharts() {
  const { resolvedTheme } = useTheme()
  const t = useTranslations('DetailedSystem.network')
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

  const filteredIcmpData = useMemo(() => filterDataByTimeframe(icmpData), [filterDataByTimeframe])
  const filteredLatencyData = useMemo(() => filterDataByTimeframe(latencyData), [filterDataByTimeframe])
  const filteredLossData = useMemo(() => filterDataByTimeframe(lossData), [filterDataByTimeframe])

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

  const resampledIcmpData = useMemo(() => makeResampler(filteredIcmpData, 'status'), [filteredIcmpData, makeResampler])
  const resampledLatencyData = useMemo(() => makeResampler(filteredLatencyData, 'latency'), [filteredLatencyData, makeResampler])
  const resampledLossData = useMemo(() => makeResampler(filteredLossData, 'loss'), [filteredLossData, makeResampler])

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
        size: 3,
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
      (overrides = {}) => ({
        ...baseOptions,
        ...overrides,
        chart: { ...baseOptions.chart, ...overrides.chart },
        xaxis: { ...baseOptions.xaxis, ...overrides.xaxis },
        tooltip: { ...baseOptions.tooltip, ...overrides.tooltip },
        yaxis: overrides.yaxis ? { ...overrides.yaxis } : undefined,
      }),
    [baseOptions]
  )

  const icmpSeries = useMemo(
    () => [
      {
        name: t('icmp'),
        data: createSeries(resampledIcmpData, 'status'),
      },
    ],
    [t, filteredIcmpData]
  )

  const latencySeries = useMemo(
    () => [
      {
        name: t('latency'),
        data: createSeries(resampledLatencyData, 'latency'),
      },
    ],
    [t, filteredLatencyData]
  )

  const lossSeries = useMemo(
    () => [
      {
        name: t('loss'),
        data: createSeries(resampledLossData, 'loss'),
      },
    ],
    [t, filteredLossData]
  )

  const icmpOptions = useMemo(
    () =>
      buildOptions({
        colors: ['#0ea5e9'],
        yaxis: {
          min: 0,
          max: 1,
          tickAmount: 2,
          labels: {
            formatter: (value) => Number(value).toFixed(0),
          },
        },
      }),
    [buildOptions]
  )

  const latencyOptions = useMemo(
    () =>
      buildOptions({
        colors: ['#f59e0b'],
        yaxis: {
          title: { text: 'ms' },
        },
      }),
    [buildOptions]
  )

  const lossOptions = useMemo(
    () =>
      buildOptions({
        colors: ['#22c55e'],
        yaxis: {
          min: 0,
          title: { text: '%' },
        },
      }),
    [buildOptions]
  )

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('icmp')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactApexChart options={icmpOptions} series={icmpSeries} type="line" height={260} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('latency')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactApexChart options={latencyOptions} series={latencySeries} type="line" height={260} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('loss')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactApexChart options={lossOptions} series={lossSeries} type="line" height={260} />
        </CardContent>
      </Card>
    </div>
  )
}
