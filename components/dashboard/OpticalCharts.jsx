import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const pdData = [
  { time: '00:00', sector1: 1.6, sector2: 3.1, sector3: 0 },
  { time: '03:00', sector1: 1.62, sector2: 3.1, sector3: 0 },
  { time: '06:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '09:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '12:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '15:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '18:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
  { time: '21:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
]

const ldData = [
  { time: '00:00', sector1: 6.65, sector2: 6.6, sector3: 6.6 },
  { time: '03:00', sector1: 6.66, sector2: 6.7, sector3: 6.7 },
  { time: '06:00', sector1: 6.67, sector2: 6.62, sector3: 6.65 },
  { time: '09:00', sector1: 6.7, sector2: 6.64, sector3: 6.68 },
  { time: '12:00', sector1: 6.72, sector2: 6.66, sector3: 6.63 },
  { time: '15:00', sector1: 6.69, sector2: 6.6, sector3: 6.61 },
  { time: '18:00', sector1: 6.68, sector2: 6.62, sector3: 6.6 },
  { time: '21:00', sector1: 6.8, sector2: 6.7, sector3: 6.75 },
]

export default function OpticalCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* PD Level Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Sector 1 RU1 PD Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={10}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  label={{ value: 'V', angle: -90, position: 'insideLeft' }}
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
                  dataKey="sector1"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sector 2 RU2 PD Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={10}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  label={{ value: 'V', angle: -90, position: 'insideLeft' }}
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
                  dataKey="sector2"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sector 3 RU3 PD Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={10}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  label={{ value: 'V', angle: -90, position: 'insideLeft' }}
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
                  dataKey="sector3"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* LD Level Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Sector 1 RU1 LD Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={10}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  label={{ value: 'mA', angle: -90, position: 'insideLeft' }}
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
                  dataKey="sector1"
                  stroke="#a78bfa" 
                  strokeWidth={2}
                  dot={{ fill: '#a78bfa', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sector 2 RU2 LD Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={10}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  label={{ value: 'mA', angle: -90, position: 'insideLeft' }}
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
                  dataKey="sector2"
                  stroke="#a78bfa" 
                  strokeWidth={2}
                  dot={{ fill: '#a78bfa', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sector 3 RU3 LD Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={10}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  label={{ value: 'mA', angle: -90, position: 'insideLeft' }}
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
                  dataKey="sector3"
                  stroke="#a78bfa" 
                  strokeWidth={2}
                  dot={{ fill: '#a78bfa', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
