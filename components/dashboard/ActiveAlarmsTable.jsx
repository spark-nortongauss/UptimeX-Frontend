"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useZabbixStore } from '@/lib/stores/zabbixStore'

export default function ActiveAlarmsTable() {
  const {
    problems,
    loading,
    error,
    fetchProblems
  } = useZabbixStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Fetch data on component mount
  useEffect(() => {
    fetchProblems({ limit: 100 }) // Fetch more data for pagination
  }, [fetchProblems])

  // Calculate pagination
  const totalPages = Math.ceil(problems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProblems = problems.slice(startIndex, endIndex)

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  // Loading state
  if (loading && problems.length === 0) {
    return (
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Active Alarms</div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading alarms...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Active Alarms</div>
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">⚠️ Error loading alarms</div>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="px-4 py-3 border-b font-semibold">
        <span>Active Alarms</span>
      </div>
      
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
            {currentProblems.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">
                  No active alarms found
                </td>
              </tr>
            ) : (
              currentProblems.map((alarm) => (
                <tr key={alarm.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-2 whitespace-nowrap font-medium">
                    <span className={cn(
                      alarm.host === 'Unknown Host' ? 'text-muted-foreground' : 'text-foreground'
                    )}>
                      {alarm.host}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      alarm.group === 'Unknown Group' ? 'text-muted-foreground' : 'text-foreground'
                    )}>
                      {alarm.group}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-bold text-white',
                      alarm.severity === 'MINOR' && 'bg-blue-500',
                      alarm.severity === 'MAJOR' && 'bg-orange-500',
                      alarm.severity === 'CRITICAL' && 'bg-red-600'
                    )}>
                      {alarm.severity || 'MINOR'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={cn('inline-flex items-center gap-1 font-semibold', alarm.statusColor)}>
                      <span className={cn('h-2 w-2 rounded-full', 
                        alarm.status === 'PROBLEM' ? 'bg-red-500' : 'bg-yellow-500'
                      )} /> 
                      {alarm.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 min-w-[320px]">
                    <div className="flex flex-col">
                      <span className="font-medium">{alarm.problem}</span>
                      {alarm.opdata && (
                        <span className="text-xs text-muted-foreground mt-1">{alarm.opdata}</span>
                      )}
                      {alarm.tags && alarm.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alarm.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-muted px-1 py-0.5 rounded">
                              {tag.tag}: {tag.value}
                            </span>
                          ))}
                          {alarm.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{alarm.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{alarm.age}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{alarm.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Page {currentPage} of {totalPages} • {problems.length} total alarms
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}