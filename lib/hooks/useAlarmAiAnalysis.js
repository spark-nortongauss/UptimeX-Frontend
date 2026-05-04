"use client"

import { useState } from 'react'
import { observoneAiService } from '@/lib/services/observoneAiService'
import { buildAiPayload } from '@/lib/ai/buildAiPayload'

const extractAiOutput = (response) => {
  if (typeof response === 'string' && response.trim().length > 0) {
    return response.trim()
  }

  if (!response || typeof response !== 'object') {
    return ''
  }

  const candidate =
    response.ai_output ||
    response.aiOutput ||
    response.data?.ai_output ||
    response.data?.aiOutput ||
    response.result?.ai_output ||
    response.zabbix_response?.value ||
    response.data?.zabbix_response?.value ||
    response.zabbix_response?.output ||
    ''

  return typeof candidate === 'string' ? candidate.trim() : ''
}

export const useAlarmAiAnalysis = () => {
  const [open, setOpen] = useState(false)
  const [targetAlarm, setTargetAlarm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setOpen(false)
    setTargetAlarm(null)
    setLoading(false)
    setResult(null)
    setError(null)
    setMetadata(null)
    setCopied(false)
  }

  const runAnalysis = async (alarm, source = 'alarm') => {
    const payload = buildAiPayload(alarm, source)
    setTargetAlarm(alarm || null)
    setOpen(true)
    setLoading(true)
    setResult(null)
    setError(null)
    setMetadata(null)
    setCopied(false)

    if (!payload.eventId || !payload.hostId) {
      setLoading(false)
      setError('Missing host or event identifiers. Please refresh and try again.')
      return
    }

    try {
      const response = await observoneAiService.diagnoseAlarm(payload)
      const aiOutput = extractAiOutput(response)
      if (!aiOutput) {
        setError('No AI diagnosis was generated. The service returned an empty response.')
        return
      }

      setResult(aiOutput)
      setMetadata({
        rowId: response?.rowId ?? response?.data?.rowId ?? payload.rowId ?? null,
        metadata: response?.metadata ?? response?.data?.metadata ?? null,
        llm: response?.llm ?? response?.data?.llm ?? null,
      })
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          err?.payload?.message ||
          'Failed to run AI diagnosis. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const copyOutput = async () => {
    if (!result || typeof navigator === 'undefined' || !navigator?.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // noop
    }
  }

  const onOpenChange = (nextOpen) => {
    if (!nextOpen) {
      reset()
      return
    }
    setOpen(true)
  }

  return {
    open,
    onOpenChange,
    targetAlarm,
    loading,
    result,
    error,
    metadata,
    copied,
    runAnalysis,
    copyOutput,
    reset,
  }
}
