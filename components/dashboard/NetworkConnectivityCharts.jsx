"use client"

import dynamic from 'next/dynamic'
import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'
import wanNetworkService from '@/lib/services/wanNetworkService'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

// Debounce hook for performance
function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Data sampling to prevent browser crashes with large datasets
function sampleData(data, maxPoints = 500) {
  if (!data || data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  const sampled = []

  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i])
  }

  // Always include the last point for accuracy
  if (sampled.length > 0 && sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1])
  }

  return sampled
}

export default function NetworkConnectivityCharts({
  chartRefs = {},
  chartInstanceRefs = {},
  systemId,
}) {
  const { resolvedTheme } = useTheme()
  const t = useTranslations('DetailedSystem.network')
  const dateFrom = useTimeframeFilterStore((state) => state.dateFrom)
  const dateTo = useTimeframeFilterStore((state) => state.dateTo)
  const timeFrom = useTimeframeFilterStore((state) => state.timeFrom)
  const timeTo = useTimeframeFilterStore((state) => state.timeTo)
  const getTimeRange = useTimeframeFilterStore((state) => state.getTimeRange)

  // Debounce timeframe values to prevent rapid re-fetches
  const debouncedDateFrom = useDebouncedValue(dateFrom, 500)
  const debouncedDateTo = useDebouncedValue(dateTo, 500)
  const debouncedTimeFrom = useDebouncedValue(timeFrom, 500)
  const debouncedTimeTo = useDebouncedValue(timeTo, 500)

  const [icmpSeriesData, setIcmpSeriesData] = useState([])
  const [latencySeriesData, setLatencySeriesData] = useState([])
  const [lossSeriesData, setLossSeriesData] = useState([])
  const [latencyStats, setLatencyStats] = useState(null)
  const [lossStats, setLossStats] = useState(null)
  const [wanLoading, setWanLoading] = useState(false)
  const [wanError, setWanError] = useState(null)

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleChartMount = useCallback(
    (key, component) => {
      if (component?.chart && chartInstanceRefs?.[key]) {
        chartInstanceRefs[key].current = component.chart
      }
    },
    [chartInstanceRefs]
  )

  // Memoized base options with SSR safety
  const baseOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        foreColor: (() => {
          if (typeof document === 'undefined') return '#fff'
          const v = getComputedStyle(document.documentElement)
            .getPropertyValue('--foreground')
            .trim()
          return v ? `hsl(${v})` : '#fff'
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
        // Performance optimizations
        animations: {
          enabled: false,
        },
        redrawOnParentResize: false,
        redrawOnWindowResize: false,
        parentHeightOffset: 0,
        offsetY: 0,
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      markers: {
        size: 3,
        strokeWidth: 2,
        strokeColors: (() => {
          if (typeof document === 'undefined') return '#1a1a1a'
          const v = getComputedStyle(document.documentElement)
            .getPropertyValue('--card')
            .trim()
          return v ? `hsl(${v})` : '#1a1a1a'
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
          offsetY: 0,
        },
      },
      grid: {
        borderColor: (() => {
          if (typeof document === 'undefined') return '#333'
          const v = getComputedStyle(document.documentElement)
            .getPropertyValue('--border')
            .trim()
          return v ? `hsl(${v})` : '#333'
        })(),
        padding: {
          top: 0,
          right: 10,
          bottom: 0,
          left: 10,
        },
      },
      tooltip: {
        x: { format: 'HH:mm' },
      },
    }),
    [resolvedTheme]
  )

  const buildOptions = useCallback(
    (overrides = {}) => ({
      ...baseOptions,
      ...overrides,
      chart: { ...baseOptions.chart, ...overrides.chart },
      xaxis: { ...baseOptions.xaxis, ...overrides.xaxis },
      tooltip: { ...baseOptions.tooltip, ...overrides.tooltip },
      grid: { ...baseOptions.grid, ...overrides.grid },
      yaxis: overrides.yaxis ? { ...overrides.yaxis } : undefined,
    }),
    [baseOptions]
  )

  const icmpSeries = useMemo(
    () => [{ name: t('icmp'), data: icmpSeriesData }],
    [t, icmpSeriesData]
  )

  const latencySeries = useMemo(
    () => [{ name: t('latency'), data: latencySeriesData }],
    [t, latencySeriesData]
  )

  const lossSeries = useMemo(
    () => [{ name: t('loss'), data: lossSeriesData }],
    [t, lossSeriesData]
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
          min: 0,
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
          max: 100,
          tickAmount: 4,
          title: { text: '%' },
          labels: {
            formatter: (value) => `${Number(value).toFixed(0)}%`,
          },
        },
      }),
    [buildOptions]
  )

  // Fetch data with debounced values
  useEffect(() => {
    let cancelled = false

    const fetchWanStatus = async () => {
      if (!systemId) {
        setIcmpSeriesData([])
        setLatencySeriesData([])
        setLossSeriesData([])
        setLatencyStats(null)
        setLossStats(null)
        setWanError(null)
        return
      }

      setWanLoading(true)
      setWanError(null)

      try {
        const { time_from, time_till } = getTimeRange()
        const response = await wanNetworkService.getStatus(systemId, {
          from: time_from,
          till: time_till,
          limit: 500, // Reduced from 2880 for performance
        })

        if (cancelled || !isMountedRef.current) return

        const hostData = response?.data ?? response

        // Process ICMP data with sampling
        const icmpHistory = hostData?.icmpStatus?.history || []
        const icmpMapped = icmpHistory.map((point) => ({
          x: Number(point.timestamp) * 1000,
          y: Number(point.value),
        }))
        setIcmpSeriesData(sampleData(icmpMapped, 500))

        // Process Latency data with sampling
        const latencyHistory = hostData?.icmpLatency?.history || []
        const latencyMapped = latencyHistory.map((point) => ({
          x: Number(point.timestamp) * 1000,
          y: Number(point.value),
        }))
        setLatencySeriesData(sampleData(latencyMapped, 500))
        setLatencyStats({
          current: hostData?.icmpLatency?.currentValue ?? null,
          min: hostData?.icmpLatency?.summary?.minValue ?? null,
          max: hostData?.icmpLatency?.summary?.maxValue ?? null,
          avg: hostData?.icmpLatency?.summary?.averageValue ?? null,
        })

        // Process Loss data with sampling
        const lossHistory = hostData?.icmpLoss?.history || []
        const lossMapped = lossHistory.map((point) => ({
          x: Number(point.timestamp) * 1000,
          y: Number(point.value),
        }))
        setLossSeriesData(sampleData(lossMapped, 500))
        setLossStats({
          current: hostData?.icmpLoss?.currentValue ?? null,
          max: hostData?.icmpLoss?.summary?.maxLossPercent ?? null,
          lossOccurrences: hostData?.icmpLoss?.summary?.lossOccurrences ?? 0,
          lossPercentage: hostData?.icmpLoss?.summary?.lossPercentage ?? null,
          hasLossNow: hostData?.icmpLoss?.summary?.hasLossNow ?? false,
        })
      } catch (error) {
        if (cancelled || !isMountedRef.current) return
        console.error('Failed to fetch WAN network status', error)
        setWanError(error?.message || 'Failed to load WAN status')
        setIcmpSeriesData([])
        setLatencySeriesData([])
        setLossSeriesData([])
        setLatencyStats(null)
        setLossStats(null)
      } finally {
        if (!cancelled && isMountedRef.current) {
          setWanLoading(false)
        }
      }
    }

    fetchWanStatus()
    return () => {
      cancelled = true
    }
  }, [systemId, debouncedDateFrom, debouncedDateTo, debouncedTimeFrom, debouncedTimeTo, getTimeRange])

  const hasNoData = !wanLoading && !wanError && icmpSeriesData.length === 0
  const hasIcmpData = icmpSeriesData.length > 0
  const hasLatencyData = latencySeriesData.length > 0
  const hasLossData = lossSeriesData.length > 0

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* ICMP Chart */}
      <Card ref={chartRefs.icmp} className="overflow-visible">
        <CardHeader className="pb-2">
          <CardTitle>{t('icmp')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          {wanLoading && (
            <p className="mb-2 text-sm text-muted-foreground">Loading ICMP status…</p>
          )}
          {wanError && <p className="mb-2 text-sm text-red-500">{wanError}</p>}
          {hasNoData && (
            <p className="mb-2 text-sm text-muted-foreground">No data available</p>
          )}
          {!wanLoading && hasIcmpData && (
            <ReactApexChart
              ref={(component) => handleChartMount('icmp', component)}
              options={icmpOptions}
              series={icmpSeries}
              type="line"
              height={280}
            />
          )}
        </CardContent>
      </Card>

      {/* Latency Chart */}
      <Card ref={chartRefs.latency} className="overflow-visible">
        <CardHeader className="pb-2">
          <CardTitle>{t('latency')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          {latencyStats && (
            <div className="mb-2 text-xs text-muted-foreground flex flex-wrap gap-4">
              <span>Min: {latencyStats.min ?? '—'} ms</span>
              <span>Max: {latencyStats.max ?? '—'} ms</span>
              <span>Avg: {latencyStats.avg ?? '—'} ms</span>
              <span>Current: {latencyStats.current ?? '—'} ms</span>
            </div>
          )}
          {wanError && <p className="mb-2 text-sm text-red-500">{wanError}</p>}
          {hasNoData && (
            <p className="mb-2 text-sm text-muted-foreground">No data available</p>
          )}
          {!wanLoading && hasLatencyData && (
            <ReactApexChart
              ref={(component) => handleChartMount('latency', component)}
              options={latencyOptions}
              series={latencySeries}
              type="line"
              height={280}
            />
          )}
        </CardContent>
      </Card>

      {/* Loss Chart */}
      <Card ref={chartRefs.loss} className="overflow-visible">
        <CardHeader className="pb-2">
          <CardTitle>{t('loss')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible pb-8">
          {lossStats && (
            <div className="mb-2 text-xs text-muted-foreground flex flex-wrap gap-4">
              <span>Current: {lossStats.current ?? 0}%</span>
              <span>Max: {lossStats.max ?? 0}%</span>
              <span>Loss Events: {lossStats.lossOccurrences ?? 0}</span>
              {typeof lossStats.lossPercentage === 'number' && (
                <span>{lossStats.lossPercentage}% of samples impacted</span>
              )}
            </div>
          )}
          {wanError && <p className="mb-2 text-sm text-red-500">{wanError}</p>}
          {hasNoData && (
            <p className="mb-2 text-sm text-muted-foreground">No data available</p>
          )}
          {!wanLoading && hasLossData && (
            <ReactApexChart
              ref={(component) => handleChartMount('loss', component)}
              options={lossOptions}
              series={lossSeries}
              type="line"
              height={320}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}