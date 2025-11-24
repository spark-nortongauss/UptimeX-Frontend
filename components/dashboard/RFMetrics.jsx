"use client"

import dynamic from 'next/dynamic'
import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'
import { zabbixService } from '@/lib/services/zabbixService'

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

export default function RFMetrics({ chartRefs = {}, chartInstanceRefs = {}, hostId }) {
  const { resolvedTheme } = useTheme()
  const dateFrom = useTimeframeFilterStore((state) => state.dateFrom)
  const dateTo = useTimeframeFilterStore((state) => state.dateTo)
  const timeFrom = useTimeframeFilterStore((state) => state.timeFrom)
  const timeTo = useTimeframeFilterStore((state) => state.timeTo)

  // Debounce timeframe values to prevent rapid re-fetches
  const debouncedDateFrom = useDebouncedValue(dateFrom, 500)
  const debouncedDateTo = useDebouncedValue(dateTo, 500)
  const debouncedTimeFrom = useDebouncedValue(timeFrom, 500)
  const debouncedTimeTo = useDebouncedValue(timeTo, 500)

  const [rfData, setRfData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Fetch RF metrics data with debounced values
  useEffect(() => {
    if (!hostId) {
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchRfMetrics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Calculate time range from timeframe filter
        const now = Math.floor(Date.now() / 1000)
        let time_from = now - 24 * 60 * 60 // Default: last 24 hours
        let time_till = now

        // If we have date filters, use them
        if (debouncedDateFrom && debouncedDateTo) {
          const fromDate = new Date(debouncedDateFrom)
          const toDate = new Date(debouncedDateTo)

          // Add time filters if same date
          if (debouncedDateFrom === debouncedDateTo && debouncedTimeFrom && debouncedTimeTo) {
            const [fromHours, fromMinutes] = debouncedTimeFrom.split(':').map(Number)
            const [toHours, toMinutes] = debouncedTimeTo.split(':').map(Number)
            fromDate.setHours(fromHours || 0, fromMinutes || 0, 0, 0)
            toDate.setHours(toHours || 23, toMinutes || 59, 59, 999)
          } else {
            fromDate.setHours(0, 0, 0, 0)
            toDate.setHours(23, 59, 59, 999)
          }

          time_from = Math.floor(fromDate.getTime() / 1000)
          time_till = Math.floor(toDate.getTime() / 1000)
        }

        const response = await zabbixService.getRfMetrics(hostId, {
          time_from,
          time_till,
        })

        if (cancelled || !isMountedRef.current) return

        if (response.success && response.data) {
          setRfData(response.data)
        } else {
          throw new Error(response.message || 'Failed to fetch RF metrics')
        }
      } catch (err) {
        if (cancelled || !isMountedRef.current) return
        console.error('Failed to fetch RF metrics:', err)
        setError(err.message || 'Failed to load RF metrics')
        setRfData(null)
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchRfMetrics()

    return () => {
      cancelled = true
    }
  }, [hostId, debouncedDateFrom, debouncedDateTo, debouncedTimeFrom, debouncedTimeTo])

  // Convert timestamp to milliseconds for chart
  const timestampToMillis = useCallback((timestamp) => {
    return timestamp * 1000
  }, [])

  // Filter history data by timeframe
  const filterHistoryByTimeframe = useCallback(
    (history) => {
      if (!history || history.length === 0) return []

      if (debouncedDateFrom === debouncedDateTo && debouncedTimeFrom && debouncedTimeTo) {
        const [fromHours, fromMinutes] = debouncedTimeFrom.split(':').map(Number)
        const [toHours, toMinutes] = debouncedTimeTo.split(':').map(Number)
        const fromTime = (fromHours || 0) * 60 + (fromMinutes || 0)
        const toTime = (toHours || 23) * 60 + (toMinutes || 59)

        return history.filter((point) => {
          const date = new Date(point.timestamp * 1000)
          const pointTime = date.getHours() * 60 + date.getMinutes()
          return pointTime >= fromTime && pointTime <= toTime
        })
      }

      return history
    },
    [debouncedDateFrom, debouncedDateTo, debouncedTimeFrom, debouncedTimeTo]
  )

  // Convert history to chart series format with sampling
  const historyToSeries = useCallback(
    (history) => {
      if (!history || history.length === 0) return []

      const filtered = filterHistoryByTimeframe(history)
      const mapped = filtered.map((point) => ({
        x: timestampToMillis(point.timestamp),
        y: point.value,
      }))

      // Sample data to prevent performance issues
      return sampleData(mapped, 500)
    },
    [filterHistoryByTimeframe, timestampToMillis]
  )

  const handleChartMount = useCallback(
    (sectorNumber, chartType, component) => {
      const chart = component?.chart
      if (!chart) return

      const sectorKey = `sector${sectorNumber}`
      const sectorRefs = chartInstanceRefs?.[sectorKey]

      if (sectorRefs?.[chartType]) {
        sectorRefs[chartType].current = chart
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
          // SSR safety check
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
          enabled: false, // Disable animations for large datasets
        },
        redrawOnParentResize: false,
        redrawOnWindowResize: false,
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      markers: {
        size: 2,
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
      },
      tooltip: {
        x: { format: 'HH:mm' },
        y: {
          formatter: (value) => {
            return value !== null && value !== undefined ? `${value.toFixed(2)} dBm` : 'N/A'
          },
        },
      },
    }),
    [resolvedTheme]
  )

  const buildOptions = useCallback(
    (color, yTitle) => ({
      ...baseOptions,
      colors: [color],
      yaxis: {
        title: { text: yTitle },
      },
    }),
    [baseOptions]
  )

  // Calculate average from history
  const calculateAverage = useCallback(
    (history) => {
      if (!history || history.length === 0) return null
      const filtered = filterHistoryByTimeframe(history)
      if (filtered.length === 0) return null
      const sum = filtered.reduce((acc, point) => acc + point.value, 0)
      return sum / filtered.length
    },
    [filterHistoryByTimeframe]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading RF metrics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Error: {error}</div>
      </div>
    )
  }

  if (!rfData || !rfData.sectors || rfData.sectors.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No RF metrics data available for this host</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {rfData.sectors.map((sector, index) => {
        const sectorNumber = Math.floor(parseFloat(sector.sector.split('.')[0]) || index + 1)
        const sectorKey = `sector${sectorNumber}`
        const sectorRefs = chartRefs[sectorKey] || {}

        // Get latest value or calculate average from history
        const txInLatest = sector.txIn?.latest ?? calculateAverage(sector.txIn?.history)
        const rxOutLatest = sector.rxOut?.latest ?? calculateAverage(sector.rxOut?.history)

        // Prepare chart series with sampled data
        const txSeries = sector.txIn
          ? [
              {
                name: `${sector.name} MU RF TX IN`,
                data: historyToSeries(sector.txIn.history),
              },
            ]
          : []

        const rxSeries = sector.rxOut
          ? [
              {
                name: `${sector.name} RU RX Out`,
                data: historyToSeries(sector.rxOut.history),
              },
            ]
          : []

        const hasTxData = txSeries.length > 0 && txSeries[0].data.length > 0
        const hasRxData = rxSeries.length > 0 && rxSeries[0].data.length > 0

        return (
          <div key={sector.sector} className="space-y-4">
            {/* TX IN Power Card */}
            {sector.txIn && (
              <Card ref={sectorRefs.powerCard}>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">{sector.name} TX-IN Power</div>
                  <div className="mt-1 text-4xl font-extrabold">
                    {txInLatest !== null && txInLatest !== undefined
                      ? `${txInLatest.toFixed(1)} dBm`
                      : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* RX OUT Power Card */}
            {sector.rxOut && (
              <Card ref={sectorRefs.rxPowerCard}>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">{sector.name} RX-OUT Power</div>
                  <div className="mt-1 text-4xl font-extrabold">
                    {rxOutLatest !== null && rxOutLatest !== undefined
                      ? `${rxOutLatest.toFixed(1)} dBm`
                      : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TX IN Chart - Only render when data is ready */}
            {sector.txIn && hasTxData && (
              <Card ref={sectorRefs.txChart}>
                <CardHeader>
                  <CardTitle>{sector.name} MU RF TX IN</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactApexChart
                    ref={(component) => handleChartMount(sectorNumber, 'txChart', component)}
                    options={buildOptions('#eab308', 'dBm')}
                    series={txSeries}
                    type="line"
                    height={220}
                  />
                </CardContent>
              </Card>
            )}

            {/* RX OUT Chart - Only render when data is ready */}
            {sector.rxOut && hasRxData && (
              <Card ref={sectorRefs.rxChart}>
                <CardHeader>
                  <CardTitle>{sector.name} RU RX Out</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactApexChart
                    ref={(component) => handleChartMount(sectorNumber, 'rxChart', component)}
                    options={buildOptions('#60a5fa', 'dBm')}
                    series={rxSeries}
                    type="line"
                    height={220}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )
      })}
    </div>
  )
}