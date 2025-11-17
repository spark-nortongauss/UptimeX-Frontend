"use client"

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAlarmsStore } from '@/lib/stores/alarmsStore'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Activity } from 'lucide-react'

export default function AlertSeverityCards() {
  const t = useTranslations('Overview.alarms')
  const { problems, statistics, loading, fetchStatistics } = useAlarmsStore()

  // Fetch statistics on mount and set up real-time updates
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  // Use statistics from Supabase if available, otherwise calculate locally
  const severityCounts = statistics?.by_severity ? statistics.by_severity : problems.reduce((acc, problem) => {
    const severity = problem.severity || 'MINOR'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {
    CRITICAL: 0,
    MAJOR: 0,
    MINOR: 0
  })

  const severityData = [
    { 
      label: t('severities.CRITICAL'), 
      value: severityCounts.CRITICAL || 0, 
      className: 'bg-red-600 text-white',
      pulseClass: 'animate-pulse'
    },
    { 
      label: t('severities.MAJOR'), 
      value: severityCounts.MAJOR || 0, 
      className: 'bg-orange-500 text-white',
      pulseClass: 'animate-pulse'
    },
    { 
      label: t('severities.MINOR'), 
      value: severityCounts.MINOR || 0, 
      className: 'bg-blue-600 text-white',
      pulseClass: ''
    }
  ]

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
      {severityData.map((severity) => (
        <Card key={severity.label} className={cn('shadow-sm border-0 relative overflow-hidden', severity.className)}>
          {/* Real-time indicator */}
          <div className="absolute top-3 right-3">
            <Activity className={cn("h-4 w-4 opacity-70", severity.pulseClass)} />
          </div>
          <CardContent className="p-5">
            <div className="text-sm font-semibold tracking-wide opacity-90 flex items-center gap-2">
              {severity.label}
              {severity.value > 0 && (
                <span className={cn(
                  "inline-flex h-2 w-2 rounded-full",
                  severity.label.includes('CRITICAL') ? 'bg-red-300 animate-ping' :
                  severity.label.includes('MAJOR') ? 'bg-orange-300 animate-ping' :
                  'bg-blue-300'
                )} />
              )}
            </div>
            <div className="text-5xl font-extrabold mt-1 transition-all duration-300">
              {severity.value}
            </div>
            {statistics?.last_updated && (
              <div className="text-xs opacity-75 mt-2">
                Last updated: {new Date(statistics.last_updated).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
