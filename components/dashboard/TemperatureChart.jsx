"use client"

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { useMonitoringDataStore } from '@/lib/stores/monitoringDataStore'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'
import { useParams } from 'next/navigation'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const SENSOR_COLORS = {
  BIU1: '#eab308',
  BIU2: '#60a5fa',
  BIU3: '#10b981',
}

const parseTimeStringToMillis = (time) => {
  if (!time) return undefined
  const [hours, minutes] = String(time).split(':').map(Number)
  if (Number.isNaN(hours)) return undefined
  return Date.UTC(1970, 0, 1, hours, minutes || 0)
}

export default function TemperatureChart({ hostId: propHostId, showTitle = true }) {
  const t = useTranslations('DetailedSystem.temperature')
  const params = useParams()

  // Get hostId from prop, params, or fallback
  const hostId = propHostId || params?.id || null

  const {
    loading,
    error,
    monitoringData,
    currentHostId,
    getTemperatureChartData,
    getAggregatedTemperatureData,
    refreshIfStale,
  } = useMonitoringDataStore()

  // Use individual selectors to avoid creating new objects on every render
  const dateFrom = useTimeframeFilterStore((state) => state.dateFrom)
  const dateTo = useTimeframeFilterStore((state) => state.dateTo)
  const timeFrom = useTimeframeFilterStore((state) => state.timeFrom)
  const timeTo = useTimeframeFilterStore((state) => state.timeTo)
  const getTimeRange = useTimeframeFilterStore((state) => state.getTimeRange)

  // Fetch monitoring data when hostId or timeframe changes
  useEffect(() => {
    if (!hostId) return

    const { time_from, time_till } = getTimeRange()

    refreshIfStale(hostId, {
      time_from,
      time_till,
      include_history: true,
    })
  }, [hostId, refreshIfStale, dateFrom, dateTo, timeFrom, timeTo, getTimeRange])

  // Get temperature chart data filtered by timeframe
  const chartData = useMemo(() => {
    if (!monitoringData || !hostId || currentHostId !== hostId) {
      return []
    }

    const aggregated = getAggregatedTemperatureData()
    let data = aggregated.length > 0 ? aggregated : getTemperatureChartData()

    // Filter data by timeframe
    const { isInRange } = useTimeframeFilterStore.getState()
    data = data.filter((point) => {
      if (point.timestamp) {
        return isInRange(point.timestamp)
      }
      // If no timestamp, try to parse from time string
      if (point.time) {
        const [hours, minutes] = point.time.split(':').map(Number)
        if (!isNaN(hours) && !isNaN(minutes)) {
          // Create a date from the current date with the time
          const now = new Date()
          const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
          const timestamp = Math.floor(checkDate.getTime() / 1000)
          return isInRange(timestamp)
        }
      }
      return false
    })

    if (data.length > 100) {
      const step = Math.ceil(data.length / 50)
      return data.filter((_, index) => index % step === 0)
    }

    return data
  }, [monitoringData, hostId, currentHostId, getTemperatureChartData, getAggregatedTemperatureData, dateFrom, dateTo, timeFrom, timeTo])

  // Determine which BIU sensors are available
  const availableSensors = useMemo(() => {
    const sensors = {
      BIU1: false,
      BIU2: false,
      BIU3: false,
    }

    chartData.forEach((point) => {
      if (point.BIU1 !== null && point.BIU1 !== undefined) sensors.BIU1 = true
      if (point.BIU2 !== null && point.BIU2 !== undefined) sensors.BIU2 = true
      if (point.BIU3 !== null && point.BIU3 !== undefined) sensors.BIU3 = true
    })

    return sensors
  }, [chartData])

  const activeSensorKeys = useMemo(
    () => Object.entries(availableSensors).filter(([, isActive]) => isActive).map(([key]) => key),
    [availableSensors]
  )

  const sensorLabels = useMemo(
    () => ({
      BIU1: t('series.biu1'),
      BIU2: t('series.biu2'),
      BIU3: t('series.biu3'),
    }),
    [t]
  )

  const series = useMemo(
    () =>
      activeSensorKeys.map((sensorKey) => ({
        name: sensorLabels[sensorKey],
        data: chartData.map((point) => ({
          x: point.timestamp ? point.timestamp * 1000 : parseTimeStringToMillis(point.time),
          y:
            point[sensorKey] !== null && point[sensorKey] !== undefined
              ? Number(point[sensorKey])
              : null,
        })),
      })),
    [activeSensorKeys, chartData, sensorLabels]
  )

  const options = useMemo(
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
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      markers: {
        size: 3,
      },
      colors: activeSensorKeys.map((key) => SENSOR_COLORS[key]),
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
      yaxis: {
        title: {
          text: '°C',
        },
      },
      grid: {
        borderColor: '#e5e7eb',
      },
      tooltip: {
        shared: true,
        x: {
          format: 'dd MMM HH:mm',
        },
      },
      legend: {
        position: 'top',
      },
    }),
    [activeSensorKeys]
  )

  // Show loading state
  if (loading && !monitoringData) {
    return (
      <Card>
        {showTitle ? (
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className={showTitle ? undefined : 'p-6'}>
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Loading temperature data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error && !monitoringData) {
    return (
      <Card>
        {showTitle ? (
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className={showTitle ? undefined : 'p-6'}>
          <div className="flex h-80 items-center justify-center">
            <p className="text-destructive">Error loading temperature data: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show no data state
  if (!chartData || chartData.length === 0 || activeSensorKeys.length === 0) {
    return (
      <Card>
        {showTitle ? (
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className={showTitle ? undefined : 'p-6'}>
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">No temperature data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showTitle ? (
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={showTitle ? undefined : 'p-6'}>
        <ReactApexChart options={options} series={series} type="line" height={320} />
      </CardContent>
    </Card>
  )
}
