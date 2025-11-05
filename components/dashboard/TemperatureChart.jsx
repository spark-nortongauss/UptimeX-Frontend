import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTranslations } from 'next-intl'

const temperatureData = [
  { time: '00:00', BIU1: 34.8, BIU2: 47.0, BIU3: 51.0 },
  { time: '03:00', BIU1: 35.0, BIU2: 47.2, BIU3: 50.9 },
  { time: '06:00', BIU1: 34.7, BIU2: 47.1, BIU3: 51.1 },
  { time: '09:00', BIU1: 34.9, BIU2: 47.0, BIU3: 51.0 },
  { time: '12:00', BIU1: 35.2, BIU2: 47.4, BIU3: 51.2 },
  { time: '15:00', BIU1: 35.0, BIU2: 47.0, BIU3: 51.0 },
  { time: '18:00', BIU1: 35.3, BIU2: 47.2, BIU3: 51.1 },
  { time: '21:00', BIU1: 34.9, BIU2: 47.1, BIU3: 51.0 },
]

export default function TemperatureChart() {
  const t = useTranslations('DetailedSystem.temperature')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
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
              <Line 
                type="monotone" 
                dataKey="BIU1" 
                stroke="#eab308" 
                strokeWidth={2}
                name={t('series.biu1')}
                dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="BIU2" 
                stroke="#60a5fa" 
                strokeWidth={2}
                name={t('series.biu2')}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="BIU3" 
                stroke="#10b981" 
                strokeWidth={2}
                name={t('series.biu3')}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
