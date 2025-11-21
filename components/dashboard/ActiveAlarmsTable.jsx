"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAlarmsStore } from '@/lib/stores/alarmsStore'
import { observoneAiService } from '@/lib/services/observoneAiService'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AlertTriangle, CircleDot, ChevronLeft, ChevronRight, Activity, Server, Tag, Clock, ScrollText, Bot, CheckCircle2, Loader2, Copy } from 'lucide-react'

export default function ActiveAlarmsTable() {
  const t = useTranslations('Overview.alarms')
  const {
    problems,
    loading,
    error,
    fetchProblems,
    acknowledgeAlarm
  } = useAlarmsStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isVisible, setIsVisible] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [acknowledgingAlarm, setAcknowledgingAlarm] = useState(null)
  const [isAcknowledging, setIsAcknowledging] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiDialogAlarm, setAiDialogAlarm] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [aiMetadata, setAiMetadata] = useState(null)
  const [aiCopied, setAiCopied] = useState(false)

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

  const handleConfirmAcknowledge = async () => {
    if (!acknowledgingAlarm) return
    
    setIsAcknowledging(true)
    try {
      const response = await acknowledgeAlarm(acknowledgingAlarm.id)
      if (response && response.success) {
        setConfirmDialogOpen(false)
        setSuccessDialogOpen(true)
        // Refresh the problems list
        await fetchProblems({ limit: 100 })
      } else {
        throw new Error(response?.message || 'Failed to acknowledge alarm')
      }
    } catch (error) {
      console.error('Failed to acknowledge alarm:', error)
      alert(`Failed to acknowledge alarm: ${error.message}`)
      setConfirmDialogOpen(false)
    } finally {
      setIsAcknowledging(false)
      setAcknowledgingAlarm(null)
    }
  }

  const resetAiDialogState = () => {
    setAiDialogOpen(false)
    setAiDialogAlarm(null)
    setAiResult(null)
    setAiError(null)
    setAiMetadata(null)
    setAiLoading(false)
    setAiCopied(false)
  }

  const handleAiAnalysis = async (alarm) => {
    const targetAlarm = alarm || null
    const eventId = targetAlarm?.id || targetAlarm?.eventid
    const hostId = targetAlarm?.hostId || targetAlarm?.host_id || targetAlarm?.hostid
  
    setAiDialogAlarm(targetAlarm)
    setAiDialogOpen(true)
    setAiResult(null)
    setAiError(null)
    setAiMetadata(null)
    setAiCopied(false)
    setAiLoading(true)
  
    if (!eventId || !hostId) {
      setAiLoading(false)
      setAiError('Missing host or event identifiers. Please refresh the alarms list and try again.')
      return
    }
  
    try {
      const response = await observoneAiService.diagnoseAlarm({
        eventId,
        hostId,
        triggerName: targetAlarm?.problem,
        rowId: targetAlarm?.id ?? targetAlarm?.eventid
      })
  
      console.log('handleAiAnalysis - Full response object:', JSON.stringify(response, null, 2))
      console.log('handleAiAnalysis - Response type:', typeof response)
      console.log('handleAiAnalysis - Response keys:', Object.keys(response || {}))
      console.log('handleAiAnalysis - Response.ai_output:', response?.ai_output)
      console.log('handleAiAnalysis - Response.ai_output type:', typeof response?.ai_output)
      console.log('handleAiAnalysis - Response.zabbix_response?.value:', response?.zabbix_response?.value)

      // The backend returns (after unwrapResponse):
      // {
      //   success: true,
      //   rowId: "27594",
      //   ai_output: "...",
      //   metadata: {...},
      //   zabbix_response: {
      //     value: "...",
      //     ...
      //   }
      // }

      let aiOutput = ''

      if (typeof response === 'string' && response.trim().length > 0) {
        // If response is directly a string
        aiOutput = response
        console.log('handleAiAnalysis - Response is a string, using directly')
      } else if (typeof response === 'object' && response !== null) {
        // Check ai_output first (primary field from backend)
        if (response.ai_output) {
          if (typeof response.ai_output === 'string') {
            aiOutput = response.ai_output
            console.log('handleAiAnalysis - Found ai_output as string, length:', aiOutput.length)
          } else {
            console.warn('handleAiAnalysis - ai_output exists but is not a string:', typeof response.ai_output)
          }
        }
        
        // Fallback to zabbix_response.value if ai_output is not available or empty
        if (!aiOutput || aiOutput.trim() === '') {
          if (response.zabbix_response?.value && typeof response.zabbix_response.value === 'string') {
            aiOutput = response.zabbix_response.value
            console.log('handleAiAnalysis - Using zabbix_response.value, length:', aiOutput.length)
          }
        }
        
        // Check other possible locations as last resort
        if (!aiOutput || aiOutput.trim() === '') {
          aiOutput = 
            response.aiOutput ||
            response.data?.ai_output ||
            response.data?.aiOutput ||
            response.result?.ai_output ||
            response.zabbix_response?.output ||
            response.data?.zabbix_response?.value ||
            ''
          
          if (aiOutput) {
            console.log('handleAiAnalysis - Found output in fallback location, length:', aiOutput.length)
          }
        }
      }

      console.log('handleAiAnalysis - Final extracted ai_output:', aiOutput ? `${aiOutput.substring(0, 100)}...` : '(empty)')
      console.log('handleAiAnalysis - Output length:', aiOutput?.length || 0)
      console.log('handleAiAnalysis - Output trimmed length:', aiOutput?.trim()?.length || 0)

      // Check if we have a valid output
      const trimmedOutput = typeof aiOutput === 'string' ? aiOutput.trim() : ''
      if (!trimmedOutput) {
        console.error('handleAiAnalysis - No valid AI output found in response')
        setAiError('No AI diagnosis was generated. The service returned an empty response.')
        setAiLoading(false)
        return
      }
      
      // Use the trimmed output
      aiOutput = trimmedOutput
  
      setAiResult(aiOutput)
      setAiMetadata({
        rowId: response?.rowId ?? response?.data?.rowId ?? targetAlarm?.id ?? null,
        metadata: response?.metadata ?? response?.data?.metadata,
        zabbix: response?.zabbix_response ?? response?.data?.zabbix_response
      })
      
      console.log('handleAiAnalysis - Successfully set AI result, length:', aiOutput.length)
    } catch (error) {
      console.error('handleAiAnalysis - Error occurred:', error)
      console.error('handleAiAnalysis - Error message:', error?.message)
      console.error('handleAiAnalysis - Error response:', error?.response?.data)
      console.error('handleAiAnalysis - Error payload:', error?.payload)
      
      // Extract error message from various possible locations
      let errorMessage = 
        error?.message || 
        error?.response?.data?.message || 
        error?.payload?.message ||
        error?.response?.data?.error ||
        'Failed to run AI diagnosis. Please try again.'
      
      // If the error message contains scope information, make it more user-friendly
      if (errorMessage.includes('scope') || errorMessage.includes('Manual host action')) {
        // Keep the detailed message as it contains helpful instructions
        errorMessage = errorMessage.replace(/\n/g, '\n\n')
      }
      
      setAiError(errorMessage)
    } finally {
      setAiLoading(false)
    }
  }

  const handleCopyAiOutput = async () => {
    if (!aiResult || typeof navigator === 'undefined' || !navigator?.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(aiResult)
      setAiCopied(true)
      setTimeout(() => setAiCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy AI output', error)
    }
  }

  const handleAiDialogOpenChange = (open) => {
    if (!open) {
      resetAiDialogState()
    } else {
      setAiDialogOpen(true)
    }
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
            Latest 10 Active Alarms
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
                  {['Host Name', 'Host Groups', 'Severity', 'Status', 'Problem', 'Age', 'Timestamp', 'Actions'].map((header) => (
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-20 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
                        <div className="h-8 w-28 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
                      </div>
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
            Latest 10 Active Alarms - Error
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
    <>
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
          <div className="ml-auto flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:text-white px-3 py-1.5 shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 transition-colors transition-shadow"
              aria-label="See Alarms Log"
              title="See Alarms Log"
            >
              <Link href="/observability/events">
                <ScrollText className="h-4 w-4 opacity-90" />
                <span>See Alarms Log</span>
              </Link>
            </Button>
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
                      "px-6 py-4 text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide transition-all duration-300",
                      index === 0 ? "font-bold" : "font-normal",
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
                  <td colSpan="8" className="px-6 py-16 text-center">
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
                        'inline-flex items-center gap-3 font-normal text-base transition-all duration-300 transform-gpu',
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
                        'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-normal shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-110 transform-gpu cursor-pointer',
                        severityStyles(alarm.severity)
                      )}>
                        {severityIcon(alarm.severity)}
                        {alarm.severity || 'MINOR'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-3 font-normal text-base"> 
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
                        <span className="font-normal text-base leading-tight text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 transform-gpu group-hover:translate-x-1">
                          {alarm.problem}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 font-normal text-base text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-all duration-300 transform-gpu group-hover:translate-x-1">
                        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-neutral-800 group-hover:bg-gray-200 dark:group-hover:bg-neutral-700 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                          <Clock className="h-4 w-4" />
                        </div>
                        {alarm.age}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-normal text-base text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 transform-gpu group-hover:scale-105">
                        {alarm.time}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-2 font-semibold transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-900 dark:hover:text-indigo-300 hover:shadow-md hover:scale-105 transform-gpu active:scale-95"
                          aria-label="AI analysis"
                          title="AI analysis"
                          onClick={() => handleAiAnalysis(alarm)}
                        >
                          <Bot className="h-4 w-4" />
                          AI
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-2 font-semibold transition-all duration-300 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/20 dark:hover:border-green-900 dark:hover:text-green-300 hover:shadow-md hover:scale-105 transform-gpu active:scale-95"
                          aria-label="Acknowledge"
                          title="Acknowledge"
                          onClick={() => {
                            setAcknowledgingAlarm(alarm)
                            setConfirmDialogOpen(true)
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Acknowledge
                        </Button>
                      </div>
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

    {/* AI Diagnosis Dialog */}
    <Dialog open={aiDialogOpen} onOpenChange={handleAiDialogOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bot className="h-5 w-5 text-indigo-600" />
            AI Diagnosis
          </DialogTitle>
        </DialogHeader>

        {aiDialogAlarm && (
          <div className="rounded-lg border border-dashed border-indigo-200/70 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/10 px-4 py-3 text-sm space-y-2">
            <div className="flex flex-wrap gap-4">
              <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Host: <span className="font-bold text-indigo-700 dark:text-indigo-100">{aiDialogAlarm.host}</span>
              </span>
              <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Event: <span className="font-bold text-indigo-700 dark:text-indigo-100">{aiDialogAlarm.id}</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {aiDialogAlarm.problem}
            </p>
          </div>
        )}

        <div className="rounded-lg border bg-background/60 dark:bg-neutral-900/60 px-4 py-4">
          {aiLoading && (
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Requesting diagnosis from Zabbix...</p>
            </div>
          )}

          {!aiLoading && aiError && (
            <div className="flex flex-col gap-4">
              <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-200">
                {aiError}
              </div>
              {aiDialogAlarm && (
                <Button
                  variant="outline"
                  onClick={() => handleAiAnalysis(aiDialogAlarm)}
                  className="self-start"
                >
                  Retry
                </Button>
              )}
            </div>
          )}

          {!aiLoading && !aiError && aiResult && (
            <div className="space-y-3">
              <pre className="whitespace-pre-wrap break-words text-sm font-mono leading-relaxed bg-background border rounded-md p-4 text-foreground">
                {aiResult}
              </pre>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Host ID: {aiDialogAlarm?.hostId || 'n/a'} • Event ID: {aiDialogAlarm?.id || 'n/a'}</p>
                  <p>Row ID: {aiMetadata?.rowId || 'n/a'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAiOutput}
                    className="inline-flex items-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {aiCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAiAnalysis(aiDialogAlarm)}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!aiLoading && !aiError && !aiResult && (
            <p className="text-sm text-muted-foreground">
              No AI output available yet. Try running the analysis again.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAiDialogState}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Confirmation Dialog */}
    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Acknowledgement
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to acknowledge this event problem?
          </DialogDescription>
        </DialogHeader>
        {acknowledgingAlarm && (
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Event Problem:</p>
              <p className="text-sm text-muted-foreground">{acknowledgingAlarm.problem}</p>
              <p className="text-xs text-muted-foreground mt-2">Host: {acknowledgingAlarm.host}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setConfirmDialogOpen(false)
              setAcknowledgingAlarm(null)
            }}
            disabled={isAcknowledging}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmAcknowledge}
            disabled={isAcknowledging}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isAcknowledging ? 'Acknowledging...' : 'Yes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Success Dialog */}
    <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Acknowledgement Successful
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 space-y-2">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              The event problem <span className="font-bold">"{acknowledgingAlarm?.problem}"</span> has been properly acknowledged.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false)
              setAcknowledgingAlarm(null)
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}