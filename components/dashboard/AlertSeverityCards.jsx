"use client"

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useZabbixStore } from '@/lib/stores/zabbixStore'

export default function AlertSeverityCards() {
  const { problems } = useZabbixStore()

  // Count severity levels from the problems data
  const severityCounts = problems.reduce((acc, problem) => {
    const severity = problem.severity || 'MINOR'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {})

  const severityData = [
    { 
      label: 'CRITICAL', 
      value: severityCounts.CRITICAL || 0, 
      className: 'bg-red-600 text-white' 
    },
    { 
      label: 'MAJOR', 
      value: severityCounts.MAJOR || 0, 
      className: 'bg-orange-500 text-white' 
    },
    { 
      label: 'MINOR', 
      value: severityCounts.MINOR || 0, 
      className: 'bg-blue-600 text-white' 
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {severityData.map((severity) => (
        <Card key={severity.label} className={cn('shadow-sm border-0', severity.className)}>
          <CardContent className="p-5">
            <div className="text-sm font-semibold tracking-wide opacity-90">
              {severity.label}
            </div>
            <div className="text-5xl font-extrabold mt-1">
              {severity.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
