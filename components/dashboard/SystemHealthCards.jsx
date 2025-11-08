import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'

// Donut gauge component with color based on SLA status
function DonutGauge({ value = 0, targetSla = null }) {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  
  // Determine color based on availability vs target SLA
  const color = useMemo(() => {
    if (targetSla === null || targetSla === undefined) {
      return 'text-primary' // Default color if no target SLA
    }
    
    const targetValue = Number(targetSla)
    const availabilityValue = Number(value)
    
    // If availability is at or above target, show green
    if (availabilityValue >= targetValue) {
      return 'text-green-500'
    }
    
    // If availability is within 10% of target (e.g., 98.2% when target is 98%), show orange
    const threshold = targetValue - 10
    if (availabilityValue >= threshold) {
      return 'text-orange-500'
    }
    
    // If availability is below threshold, show red
    return 'text-red-500'
  }, [value, targetSla])
  
  return (
    <svg viewBox="0 0 140 140" className="w-36 h-36">
      <circle 
        cx="70" 
        cy="70" 
        r={radius} 
        stroke="#e5e7eb" 
        strokeWidth="14" 
        fill="none" 
      />
      <circle
        cx="70"
        cy="70"
        r={radius}
        stroke="currentColor"
        className={color}
        strokeWidth="14"
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        fill="none"
        transform="rotate(-90 70 70)"
      />
      <text 
        x="70" 
        y="78" 
        textAnchor="middle" 
        className="fill-foreground text-2xl font-bold"
      >
        {value.toFixed(1)}%
      </text>
    </svg>
  )
}

export default function SystemHealthCards({ availability, targetSla = null }) {
  const { useTranslations } = require('next-intl')
  const t = useTranslations('Overview.health')
  const availabilityValue = typeof availability === 'number' && !Number.isNaN(availability)
    ? Math.max(0, Math.min(100, Number(availability.toFixed(2))))
    : 0
  
  // Parse targetSla if it's a string like "98%"
  const targetSlaValue = useMemo(() => {
    if (targetSla === null || targetSla === undefined) return null
    if (typeof targetSla === 'string') {
      const num = Number(targetSla.replace('%', ''))
      return isNaN(num) ? null : num
    }
    return Number(targetSla)
  }, [targetSla])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('overallStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36 grid place-items-center">
            <div className="text-6xl font-extrabold text-primary">{t('up')}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('overallAvailability')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <DonutGauge value={availabilityValue} targetSla={targetSlaValue} />
        </CardContent>
      </Card>
    </div>
  )
}