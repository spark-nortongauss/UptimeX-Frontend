"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { useMonitoringDataStore } from '@/lib/stores/monitoringDataStore'
import { useParams } from 'next/navigation'

export default function TemperatureChart({ hostId: propHostId }) {
  const t = useTranslations('DetailedSystem.temperature')
  const params = useParams()
  
  // Get hostId from prop, params, or fallback
  const hostId = propHostId || params?.id || null

  const {
    loading,
    error,
    monitoringData,
    currentHostId,
    fetchMonitoringData,
    getTemperatureChartData,
    getAggregatedTemperatureData,
    refreshIfStale,
  } = useMonitoringDataStore()

  // Fetch monitoring data when hostId is available
  useEffect(() => {
    if (!hostId) return

    // Fetch data with 24 hours history
    const now = Math.floor(Date.now() / 1000)
    const time_from = now - 24 * 60 * 60 // 24 hours ago

    refreshIfStale(hostId, {
      time_from,
      time_till: now,
      include_history: true,
    })
  }, [hostId, refreshIfStale])

  // Get temperature chart data
  const chartData = useMemo(() => {
    // Only use monitoringData if it's for the current hostId
    if (!monitoringData || !hostId || currentHostId !== hostId) {
      return []
    }

    // Get aggregated data (hourly averages)
    const aggregated = getAggregatedTemperatureData()

    // If we have data, return it. Otherwise try raw data.
    if (aggregated.length > 0) {
      return aggregated
    }

    // Fallback to raw chart data
    const rawData = getTemperatureChartData()
    
    // If we have too many data points, sample them for better visualization
    if (rawData.length > 100) {
      const step = Math.ceil(rawData.length / 50) // Sample to ~50 points
      return rawData.filter((_, index) => index % step === 0)
    }

    return rawData
  }, [monitoringData, hostId, getTemperatureChartData, getAggregatedTemperatureData])

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

  // Show loading state
  if (loading && !monitoringData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">Loading temperature data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error && !monitoringData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-red-500">Error loading temperature data: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show no data state
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">No temperature data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: '°C', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend />
              {availableSensors.BIU1 && (
                <Line 
                  type="monotone" 
                  dataKey="BIU1" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  name={t('series.biu1')}
                  dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
              )}
              {availableSensors.BIU2 && (
                <Line 
                  type="monotone" 
                  dataKey="BIU2" 
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  name={t('series.biu2')}
                  dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
              )}
              {availableSensors.BIU3 && (
                <Line 
                  type="monotone" 
                  dataKey="BIU3" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name={t('series.biu3')}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
