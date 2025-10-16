import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const severityData = [
  { label: 'CRITICAL', value: 0, className: 'bg-red-600 text-white' },
  { label: 'MAJOR', value: 4, className: 'bg-orange-500 text-white' },
  { label: 'MINOR', value: 5, className: 'bg-blue-600 text-white' }
]

export default function AlertSeverityCards() {
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
