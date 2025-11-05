import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslations } from 'next-intl'

const icmpData = [
  { time: '00:00', status: 1 },
  { time: '03:00', status: 1 },
  { time: '06:00', status: 1 },
  { time: '09:00', status: 1 },
  { time: '12:00', status: 1 },
  { time: '15:00', status: 1 },
  { time: '18:00', status: 1 },
  { time: '21:00', status: 1 },
]

const latencyData = [
  { time: '00:00', latency: 182 },
  { time: '03:00', latency: 180 },
  { time: '06:00', latency: 185 },
  { time: '09:00', latency: 170 },
  { time: '12:00', latency: 182 },
  { time: '15:00', latency: 181 },
  { time: '18:00', latency: 176 },
  { time: '21:00', latency: 185 },
]

const lossData = [
  { time: '00:00', loss: 0 },
  { time: '03:00', loss: 0 },
  { time: '06:00', loss: 1 },
  { time: '09:00', loss: 0 },
  { time: '12:00', loss: 0 },
  { time: '15:00', loss: 0 },
  { time: '18:00', loss: 1 },
  { time: '21:00', loss: 0 },
]

export default function NetworkConnectivityCharts() {
  const t = useTranslations('DetailedSystem.network')
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('icmp')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={icmpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 1]}
                  ticks={[0, 1]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="status" 
                  stroke="#eab308" 
                  strokeWidth={3}
                  dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('latency')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('loss')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: '%', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
