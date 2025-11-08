"use client"

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
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
      markers: { size: 3 },
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
        data: createSeries(filteredIcmpData, 'status'),
      },
    ],
    [t, filteredIcmpData]
  )

  const latencySeries = useMemo(
    () => [
      {
        name: t('latency'),
        data: createSeries(filteredLatencyData, 'latency'),
      },
    ],
    [t, filteredLatencyData]
  )

  const lossSeries = useMemo(
    () => [
      {
        name: t('loss'),
        data: createSeries(filteredLossData, 'loss'),
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
