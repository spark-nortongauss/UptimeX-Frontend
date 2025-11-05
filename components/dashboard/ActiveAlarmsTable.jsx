"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useZabbixStore } from '@/lib/stores/zabbixStore'
import { useTranslations } from 'next-intl'
import { AlertTriangle, CircleDot, ChevronLeft, ChevronRight, Activity, Server, Tag, Clock } from 'lucide-react'

export default function ActiveAlarmsTable() {
  const t = useTranslations('Overview.alarms')
  const {
    problems,
    loading,
    error,
    fetchProblems
  } = useZabbixStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch data on component mount
  useEffect(() => {
    fetchProblems({ limit: 100 }) // Fetch more data for pagination
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
  }, [fetchProblems])

  // Calculate pagination with memo to avoid re-computation
  const { totalPages, currentProblems } = useMemo(() => {
    const totalPagesCalc = Math.ceil(problems.length / itemsPerPage) || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return {
      totalPages: totalPagesCalc,
      currentProblems: problems.slice(startIndex, endIndex)
    }
  }, [problems, currentPage, itemsPerPage])

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const severityStyles = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 '
      case 'MAJOR':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
      case 'MINOR':
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
    }
  }

  const severityIcon = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
      case 'MAJOR':
        return <Activity className="h-3.5 w-3.5 animate-pulse" />
      case 'MINOR':
      default:
        return <CircleDot className="h-3.5 w-3.5" />
    }
  }

  // Enhanced Loading state with skeleton animation
  if (loading && problems.length === 0) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-neutral-900 dark:to-neutral-900/50 animate-fade-in">
        <CardHeader className="border-b border-gray-200/60 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 animate-pulse">
              <Server className="h-6 w-6" />
            </div>
            Active Alarms
            <div className="ml-auto">
              <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-neutral-900 dark:to-neutral-900/80 border-b border-gray-200/60 dark:border-neutral-800">
                <tr className="text-left">
                  {['Host', 'Host Groups', 'Severity', 'Status', 'Problem', 'Age', 'Time'].map((header) => (
                    <th key={header} className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md"></div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md"></div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded-lg"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
                        <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                        <div className="h-3 w-32 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md"></div>
                        <div className="h-4 w-12 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200/60 dark:border-neutral-800 bg-gradient-to-r from-gray-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-900">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Loading alarms...</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 animate-shake">
        <CardHeader className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-red-700">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-600 animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
            Active Alarms - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-10 text-center">
            <div className="text-red-500 mb-4 text-4xl animate-bounce">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">Error loading alarms</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-neutral-900 dark:to-neutral-900/50 transition-all duration-700 ease-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <CardHeader className="border-b border-gray-200/60 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 transition-all duration-300 hover:bg-blue-500/20 hover:scale-110">
            <Server className="h-6 w-6" />
          </div>
          <span className="animate-fade-in-up">{t('title')}</span>
          <div className="ml-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-950 dark:to-blue-900 dark:text-blue-200 animate-fade-in-left shadow-sm hover:shadow-md transition-all duration-300">
              {problems.length} {t('total')}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-neutral-900 dark:to-neutral-900/80 border-b border-gray-200/60 dark:border-neutral-800">
              <tr className="text-left">
                {t.raw('headers').map((header, index) => (
                  <th 
                    key={header} 
                    className={cn(
                      "px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide transition-all duration-300",
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    )}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {currentProblems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400 animate-fade-in">
                      <div className="p-4 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse">
                        <CircleDot className="h-8 w-8" />
                      </div>
                      <div className="animate-fade-in-up">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">No active alarms found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your system is running smoothly</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentProblems.map((alarm, index) => (
                  <tr 
                    key={alarm.id} 
                    className={cn(
                      "group transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/10 hover:shadow-md hover:scale-[1.01] transform-gpu",
                      index % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-gray-50/30 dark:bg-neutral-900/50",
                      isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    )}
                    style={{ 
                      transitionDelay: `${index * 100}ms`,
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        'inline-flex items-center gap-3 font-bold text-base transition-all duration-300 transform-gpu',
                        alarm.host === 'Unknown Host' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:translate-x-1'
                      )}>
                        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-neutral-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/30 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110">
                          <Server className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </div>
                        {alarm.host}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-3 font-bold text-base transition-all duration-300 transform-gpu',
                        alarm.group === 'Unknown Group' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-hover:translate-x-1'
                      )}>
                        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-neutral-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/30 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110">
                          <Tag className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        </div>
                        {alarm.group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-110 transform-gpu cursor-pointer',
                        severityStyles(alarm.severity)
                      )}>
                        {severityIcon(alarm.severity)}
                        {alarm.severity || 'MINOR'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-3 font-bold text-base"> 
                        <div className="relative">
                          <span className={cn(
                            'relative h-3 w-3 rounded-full transition-all duration-500 transform-gpu',
                            alarm.status === 'PROBLEM' ? 'bg-red-500 shadow-red-200 shadow-lg animate-pulse' : 'bg-yellow-500 shadow-yellow-200 shadow-lg animate-pulse'
                          )}>
                            <span className="absolute inset-0 rounded-full animate-ping opacity-40"></span>
                            <span className="absolute inset-0 rounded-full animate-pulse opacity-60"></span>
                          </span>
                        </div>
                        <span className={cn(
                          'transition-all duration-300 transform-gpu group-hover:scale-105',
                          alarm.status === 'PROBLEM' ? 'text-red-700 dark:text-red-400 group-hover:text-red-800 dark:group-hover:text-red-300' : 'text-yellow-700 dark:text-yellow-400 group-hover:text-yellow-800 dark:group-hover:text-yellow-300'
                        )}>
                          {alarm.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-[320px]">
                      <div className="flex flex-col space-y-2">
                        <span className="font-bold text-base leading-tight text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 transform-gpu group-hover:translate-x-1">
                          {alarm.problem}
                        </span>
                        {alarm.opdata && (
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-neutral-800/70 px-3 py-1 rounded-md group-hover:bg-gray-100 dark:group-hover:bg-neutral-800 transition-all duration-300 transform-gpu group-hover:scale-105">
                            {alarm.opdata}
                          </span>
                        )}
                        {alarm.tags && alarm.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {alarm.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex} 
                                className="text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-200 px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/40 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900 dark:hover:to-indigo-900 transition-all duration-300 transform-gpu hover:scale-110 hover:-translate-y-0.5 cursor-pointer"
                                style={{ animationDelay: `${tagIndex * 50}ms` }}
                              >
                                {tag.tag}: {tag.value}
                              </span>
                            ))}
                            {alarm.tags.length > 3 && (
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all duration-300 transform-gpu hover:scale-110">
                                +{alarm.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 font-bold text-base text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-all duration-300 transform-gpu group-hover:translate-x-1">
                        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-neutral-800 group-hover:bg-gray-200 dark:group-hover:bg-neutral-700 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                          <Clock className="h-4 w-4" />
                        </div>
                        {alarm.age}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-base text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 transform-gpu group-hover:scale-105">
                        {alarm.time}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200/60 dark:border-neutral-800 bg-gradient-to-r from-gray-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-900 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 animate-fade-in-right">
            <span className="text-gray-800 dark:text-gray-100">Page {currentPage}</span> of <span className="text-gray-800 dark:text-gray-100">{totalPages}</span> • 
            <span className="text-blue-600 dark:text-blue-400 ml-1">{problems.length} total alarms</span>
          </div>
          <div className="flex items-center gap-3 animate-fade-in-left">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 font-semibold transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-900 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:scale-105 transform-gpu active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 font-semibold transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-900 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:scale-105 transform-gpu active:scale-95"
            >
              Next
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}