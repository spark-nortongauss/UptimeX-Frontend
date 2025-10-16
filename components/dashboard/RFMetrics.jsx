import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const rfTxData = [
  { time: '00:00', sector1: 34.6, sector2: 34.2, sector3: 33.2 },
  { time: '03:00', sector1: 34.9, sector2: 34.9, sector3: 33.6 },
  { time: '06:00', sector1: 34.7, sector2: 35.0, sector3: 33.8 },
  { time: '09:00', sector1: 34.5, sector2: 34.5, sector3: 33.3 },
  { time: '12:00', sector1: 35.1, sector2: 35.2, sector3: 33.9 },
  { time: '15:00', sector1: 34.8, sector2: 34.7, sector3: 34.1 },
  { time: '18:00', sector1: 34.9, sector2: 34.8, sector3: 33.7 },
  { time: '21:00', sector1: 35.2, sector2: 35.1, sector3: 33.4 },
]

const rfRxData = [
  { time: '00:00', sector1: 46, sector2: 45.5, sector3: 46.2 },
  { time: '03:00', sector1: 45.5, sector2: 46.2, sector3: 45.7 },
  { time: '06:00', sector1: 46.2, sector2: 45.7, sector3: 46.8 },
  { time: '09:00', sector1: 45.7, sector2: 46.8, sector3: 46.1 },
  { time: '12:00', sector1: 46.8, sector2: 46.1, sector3: 45.9 },
  { time: '15:00', sector1: 46.1, sector2: 45.9, sector3: 46.4 },
  { time: '18:00', sector1: 45.9, sector2: 46.4, sector3: 46.0 },
  { time: '21:00', sector1: 46.4, sector2: 46.0, sector3: 45.8 },
]

const sectorData = [
  { avg: 34.9, sector: 1 },
  { avg: 35.0, sector: 2 },
  { avg: 33.4, sector: 3 }
]

export default function RFMetrics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {sectorData.map((sector) => (
        <div key={sector.sector} className="space-y-4">
          {/* Average Power Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">
                Avg. Sector {sector.sector} RF TX IN Power
              </div>
              <div className="text-4xl font-extrabold mt-1">
                {sector.avg} dBm
              </div>
            </CardContent>
          </Card>

          {/* TX Power Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sector {sector.sector} MU RF TX IN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rfTxData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                      label={{ value: 'dBm', angle: -90, position: 'insideLeft' }}
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
                      dataKey={`sector${sector.sector}`}
                      stroke="#eab308" 
                      strokeWidth={2}
                      dot={{ fill: '#eab308', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* RX Power Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sector {sector.sector} RU RX Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rfRxData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                      label={{ value: 'dBm', angle: -90, position: 'insideLeft' }}
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
                      dataKey={`sector${sector.sector}`}
                      stroke="#60a5fa" 
                      strokeWidth={2}
                      dot={{ fill: '#60a5fa', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
