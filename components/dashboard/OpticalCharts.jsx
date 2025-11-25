"use client"

import dynamic from 'next/dynamic'
import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'
import { zabbixService } from '@/lib/services/zabbixService'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

const sampleSeries = (data, maxPoints = 500) => {
  if (!Array.isArray(data) || data.length <= maxPoints) {
    return data || []
  }
  const step = Math.ceil(data.length / maxPoints)
  const sampled = []
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i])
  }
  if (sampled.length > 0 && sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1])
  }
  return sampled
}

const sanitizeKey = (value = '') =>
  value
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '-')
    .toLowerCase()

export default function OpticalCharts({ hostId, chartRefs = {}, chartInstanceRefs = {} }) {
  const { resolvedTheme } = useTheme()
  const dateFrom = useTimeframeFilterStore((state) => state.dateFrom)
  const dateTo = useTimeframeFilterStore((state) => state.dateTo)
  const timeFrom = useTimeframeFilterStore((state) => state.timeFrom)
  const timeTo = useTimeframeFilterStore((state) => state.timeTo)

  const debouncedDateFrom = useDebouncedValue(dateFrom, 500)
  const debouncedDateTo = useDebouncedValue(dateTo, 500)
  const debouncedTimeFrom = useDebouncedValue(timeFrom, 500)
  const debouncedTimeTo = useDebouncedValue(timeTo, 500)

  const [opticalData, setOpticalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!hostId) {
      setLoading(false)
      setOpticalData(null)
      return
    }

    let cancelled = false
    const fetchOpticalStatus = async () => {
      try {
        setLoading(true)
        setError(null)

        const now = Math.floor(Date.now() / 1000)
        let time_from = now - 24 * 60 * 60
        let time_till = now

        if (debouncedDateFrom && debouncedDateTo) {
          const fromDate = new Date(debouncedDateFrom)
          const toDate = new Date(debouncedDateTo)

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

        const response = await zabbixService.getOpticalStatus(hostId, {
          time_from,
          time_till,
        })

        if (cancelled || !isMountedRef.current) return

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch optical status')
        }

        setOpticalData(response)
      } catch (err) {
        if (cancelled || !isMountedRef.current) return
        console.error('Failed to fetch optical status:', err)
        setError(err.message || 'Failed to load optical status')
        setOpticalData(null)
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchOpticalStatus()

    return () => {
      cancelled = true
    }
  }, [hostId, debouncedDateFrom, debouncedDateTo, debouncedTimeFrom, debouncedTimeTo])

  const ensureChartInstanceRef = useCallback(
    (key, label) => {
      if (!chartInstanceRefs) return null
      if (!chartInstanceRefs[key]) {
        chartInstanceRefs[key] = { current: null, label }
      } else if (label) {
        chartInstanceRefs[key].label = label
      }
      return chartInstanceRefs[key]
    },
    [chartInstanceRefs]
  )

  const ensureDomRef = useCallback(
    (key) => {
      if (!chartRefs) return null
      if (!chartRefs[key]) {
        chartRefs[key] = { current: null }
      }
      return chartRefs[key]
    },
    [chartRefs]
  )

  const handleChartMount = useCallback(
    (key, label, component) => {
      if (!component?.chart) return
      const refObj = ensureChartInstanceRef(key, label)
      if (refObj) {
        refObj.current = component.chart
      }
    },
    [ensureChartInstanceRef]
  )

  const baseOptions = useMemo(() => {
    const safeCssValue = (variable) => {
      if (typeof document === 'undefined') return '#fff'
      const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
      return value ? `hsl(${value})` : '#fff'
    }

    return {
      chart: {
        type: 'line',
        foreColor: safeCssValue('--foreground'),
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
        animations: {
          enabled: false,
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      markers: {
        size: 2,
        strokeWidth: 2,
        strokeColors: safeCssValue('--card'),
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
        borderColor: safeCssValue('--border'),
      },
      tooltip: {
        x: { format: 'HH:mm' },
      },
    }
  }, [resolvedTheme])

  const buildOptions = useCallback(
    (color, yTitle, unitLabel) => ({
      ...baseOptions,
      colors: [color],
      yaxis: {
        title: { text: yTitle || unitLabel || '' },
        labels: {
          formatter: (value) => (Number.isFinite(value) ? `${value.toFixed(2)} ${unitLabel || ''}`.trim() : 'N/A'),
        },
      },
    }),
    [baseOptions]
  )

  const historyToSeries = useCallback((history) => {
    if (!Array.isArray(history) || history.length === 0) return []
    const mapped = history
      .map((point) => ({
        x: point.timestamp * 1000,
        y: Number(point.value),
      }))
      .filter((point) => Number.isFinite(point.y))
    return sampleSeries(mapped)
  }, [])

  const renderLevelCard = useCallback(
    (unit, level, type) => {
      const title = `${unit.displayName} ${type === 'PD' ? 'PD' : 'LD'} Level`
      const chartKey = `${sanitizeKey(unit.ruId)}__${type.toLowerCase()}`
      const domRef = ensureDomRef ? ensureDomRef(chartKey) : undefined

      if (!level) {
        return (
          <Card key={`${unit.ruId}-${type}`} ref={domRef}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">No data available for this level.</div>
            </CardContent>
          </Card>
        )
      }

      const valueLabel =
        level.currentValue !== null && level.currentValue !== undefined
          ? `${level.currentValue.toFixed(2)} ${level.unit || ''}`.trim()
          : 'N/A'

      const lastChecked =
        level.lastCheck && Number.isFinite(level.lastCheck)
          ? new Date(level.lastCheck * 1000).toLocaleString()
          : 'N/A'

      const series = historyToSeries(level.history)
      const hasSeries = series.length > 0

      return (
        <Card key={`${unit.ruId}-${type}`} ref={domRef}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Current Value</div>
                <div className="text-3xl font-semibold">{valueLabel}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Last Check</div>
                <div className="font-medium">{lastChecked}</div>
              </div>
            </div>

            {hasSeries ? (
              <ReactApexChart
                ref={(component) => handleChartMount(chartKey, title, component)}
                options={buildOptions(type === 'PD' ? '#22c55e' : '#a78bfa', title, level.unit)}
                series={[
                  {
                    name: title,
                    data: series,
                  },
                ]}
                type="line"
                height={220}
              />
            ) : (
              <div className="text-sm text-muted-foreground">No historical data in selected range.</div>
            )}
          </CardContent>
        </Card>
      )
    },
    [buildOptions, ensureDomRef, handleChartMount, historyToSeries]
  )

  if (!hostId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Select a system to view optical status.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading optical status...</div>
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

  if (!opticalData || !Array.isArray(opticalData.opticalUnits) || opticalData.opticalUnits.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No optical monitoring data available for this host.</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {opticalData.opticalUnits.map((unit) => (
        <div key={unit.ruId} className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Optical Unit</div>
            <div className="text-lg font-semibold">{unit.displayName}</div>
            <div className="text-sm text-muted-foreground">{unit.ruId}</div>
          </div>
          {renderLevelCard(unit, unit.pdLevel, 'PD')}
          {renderLevelCard(unit, unit.ldLevel, 'LD')}
        </div>
      ))}
    </div>
  )
}
