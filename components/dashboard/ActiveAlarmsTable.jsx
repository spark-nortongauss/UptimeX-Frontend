import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const severityStyles = {
  CRITICAL: 'bg-red-500/90 text-white',
  MAJOR: 'bg-orange-500/90 text-white',
  MINOR: 'bg-blue-500/90 text-white',
}

const alarms = [
  { 
    host: 'Symphony House', 
    group: 'DAS', 
    severity: 'MINOR', 
    status: 'PROBLEM', 
    problem: 'ICMP Ping: High ICMP ping response time', 
    age: '9 hours', 
    time: '14 Oct 2025 21:52:36' 
  },
  { 
    host: 'Solid-test', 
    group: 'DAS', 
    severity: 'CRITICAL', 
    status: 'PROBLEM', 
    problem: 'ROU 3.1.1.0.1 Device Disconnect', 
    age: 'a month', 
    time: '13 Sep 2025 02:11:00' 
  },
  { 
    host: 'Solid-test', 
    group: 'DAS', 
    severity: 'MAJOR', 
    status: 'PROBLEM', 
    problem: 'FAN 2.1.1.0.1 STOPS', 
    age: '2 months', 
    time: '18 Aug 2025 02:40:31' 
  },
  { 
    host: 'Solid-test', 
    group: 'DAS', 
    severity: 'MAJOR', 
    status: 'PROBLEM', 
    problem: 'FAN 1.1.1.0.1 STOPS', 
    age: '2 months', 
    time: '18 Aug 2025 02:30:35' 
  },
  { 
    host: 'Orlando Fashion Square - DAS', 
    group: 'DAS', 
    severity: 'CRITICAL', 
    status: 'PROBLEM', 
    problem: 'ICMP Ping: Unavailable by ICMP ping', 
    age: '2 months', 
    time: '15 Aug 2025 23:01:42' 
  },
]

export default function ActiveAlarmsTable() {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="px-4 py-3 border-b font-semibold">Active Alarms</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              {['Host', 'Host Groups', 'Severity', 'Status', 'Problem', 'Age', 'Time'].map((header) => (
                <th key={header} className="px-4 py-2 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2 whitespace-nowrap">{alarm.host}</td>
                <td className="px-4 py-2">{alarm.group}</td>
                <td className="px-4 py-2">
                  <span className={cn('px-2 py-1 rounded text-xs font-bold', severityStyles[alarm.severity])}>
                    {alarm.severity}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> 
                    {alarm.status}
                  </span>
                </td>
                <td className="px-4 py-2 min-w-[320px]">{alarm.problem}</td>
                <td className="px-4 py-2 whitespace-nowrap">{alarm.age}</td>
                <td className="px-4 py-2 whitespace-nowrap">{alarm.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div>Page 1 of 1</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  )
}
