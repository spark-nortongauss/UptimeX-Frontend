"use client"

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAlarmsStore } from '@/lib/stores/alarmsStore'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { Activity, AlertTriangle, CircleDot, TrendingDown, TrendingUp } from 'lucide-react'

export default function AlertSeverityCards() {
  const t = useTranslations('Overview.alarms')
  const { problems, statistics, loading, fetchStatistics } = useAlarmsStore()

  // Fetch statistics on mount and set up real-time updates
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const severityBlueprint = [
    {
      key: 'CRITICAL',
      label: t('severities.CRITICAL'),
      gradient: 'from-[#f87171] via-[#ef4444] to-[#dc2626]',
      icon: AlertTriangle,
    },
    {
      key: 'MAJOR',
      label: t('severities.MAJOR'),
      gradient: 'from-[#fb923c] via-[#f97316] to-[#ea580c]',
      icon: Activity,
    },
    {
      key: 'MINOR',
      label: t('severities.MINOR'),
      gradient: 'from-[#60a5fa] via-[#3b82f6] to-[#2563eb]',
      icon: CircleDot,
    },
  ]

  const localCounts = useMemo(() => problems.reduce((acc, problem) => {
    const severity = problem.severity || 'MINOR'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {
    CRITICAL: 0,
    MAJOR: 0,
    MINOR: 0
  }), [problems])

  const totalActive = statistics?.total ?? problems.length ?? 0
  const weeklySummary = statistics?.weekly_summary?.severities ?? {}

  const formatPercent = (value) => {
    if (!Number.isFinite(value)) return '0'
    if (value >= 100) return '100'
    if (value >= 10) return value.toFixed(0)
    return value.toFixed(1)
  }

  const buildChange = (current, previous) => {
    if (current === null || previous === null || current === undefined || previous === undefined) {
      return { direction: 'none', value: 0, hasData: false }
    }

    if (current === 0 && previous === 0) {
      return { direction: 'flat', value: 0, hasData: true }
    }

    if (previous === 0) {
      return { direction: current > 0 ? 'up' : 'flat', value: 100, hasData: true }
    }

    const diff = ((current - previous) / previous) * 100
    return {
      direction: diff === 0 ? 'flat' : diff > 0 ? 'up' : 'down',
      value: Math.abs(diff),
      hasData: true
    }
  }

  const severityData = severityBlueprint.map((severity) => {
    const counts = statistics?.by_severity || localCounts
    const totalCount = counts?.[severity.key] ?? 0
    const backendSummary = weeklySummary?.[severity.key]
    const percentage = backendSummary?.sharePercentage ?? (totalActive > 0 ? (totalCount / totalActive) * 100 : 0)
    const currentWeekCount = backendSummary?.currentWeekCount ?? null
    const previousWeekCount = backendSummary?.previousWeekCount ?? null
    const shareValue = Number.isFinite(percentage) ? Number(percentage) : 0
    const change = backendSummary?.changePercentage !== undefined
      ? {
          direction: backendSummary.changePercentage === 0
            ? 'flat'
            : backendSummary.changePercentage > 0
              ? 'up'
              : 'down',
          value: Math.abs(backendSummary.changePercentage),
          hasData: true
        }
      : buildChange(currentWeekCount, previousWeekCount)

    return {
      ...severity,
      value: Number(shareValue.toFixed(2)),
      totalCount,
      currentWeekCount,
      previousWeekCount,
      change
    }
  })

  // Loading state
  if (loading && !statistics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm border-0 bg-gray-200 dark:bg-neutral-800 animate-pulse">
            <CardContent className="p-5">
              <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-20 mb-2"></div>
              <div className="h-12 bg-gray-300 dark:bg-neutral-700 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {severityData.map((severity) => {
        const Icon = severity.icon
        const changeLabel = !severity.change.hasData
          ? 'Tracking weekly performance...'
          : severity.change.direction === 'flat'
            ? 'No change from last week'
            : `${severity.change.value.toFixed(2)}% ${severity.change.direction === 'down' ? 'improvement' : 'increase'} from last week`

        return (
          <Card
            key={severity.label}
            className={cn(
              'relative overflow-hidden border-0 text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl',
              'bg-gradient-to-br',
              severity.gradient
            )}
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,#fff,transparent_45%)]" />
            <CardContent className="relative p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-80">{severity.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold">{formatPercent(severity.value)}%</span>
                    <span className="text-sm opacity-80">{totalActive > 0 ? 'of active hosts' : ''}</span>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-white/15 backdrop-blur-sm">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="rounded-full bg-white/15 px-3 py-1">
                  {severity.totalCount} of {totalActive || 0} hosts
                </div>
                <div className="text-xs opacity-90">
                  This week: {severity.currentWeekCount ?? '—'} • Last week: {severity.previousWeekCount ?? '—'}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs font-semibold">
                {severity.change.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : severity.change.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <Activity className="h-4 w-4 opacity-80" />
                )}
                <span>{changeLabel}</span>
              </div>

              {statistics?.last_updated && (
                <div className="mt-3 text-[11px] opacity-70">
                  Last updated {new Date(statistics.last_updated).toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
