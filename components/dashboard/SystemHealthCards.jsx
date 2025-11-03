import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Donut gauge component
function DonutGauge({ value = 0 }) {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  
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
        className="text-primary"
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
        {value}%
      </text>
    </svg>
  )
}

export default function SystemHealthCards({ availability }) {
  const availabilityValue = typeof availability === 'number' && !Number.isNaN(availability)
    ? Math.max(0, Math.min(100, Number(availability.toFixed(2))))
    : 0
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Overall System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36 grid place-items-center">
            <div className="text-6xl font-extrabold text-primary">UP</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Overall Availability</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <DonutGauge value={availabilityValue} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-3">
          <Button>Open a Ticket</Button>
          <Button variant="secondary">+ Add Device</Button>
        </CardContent>
      </Card>
    </div>
  )
}
