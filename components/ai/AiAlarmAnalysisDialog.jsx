"use client"

import { useState } from 'react'
import {
  Bot, Copy, Loader2, RefreshCw, Server, Tag,
  FileText, AlertTriangle, GitBranch, ListChecks, Wrench, BarChart2,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function parseAiOutput(text) {
  if (!text) return null

  const extract = (label) => {
    const regex = new RegExp(`##\\s*${label}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  const extractList = (label) => {
    const raw = extract(label)
    return raw
      .split('\n')
      .map((line) => line.replace(/^[-*\d.]+\*?\*?\s*/, '').replace(/\*\*/g, '').trim())
      .filter(Boolean)
  }

  const sections = {
    summary: extract('Incident Summary'),
    impact: extractList('Potential Impact'),
    rootCauses: extractList('Probable Root Causes'),
    steps: extractList('Recommended Investigation Steps'),
    remediation: extractList('Suggested Remediation'),
    confidence: extract('Confidence'),
  }

  const hasParsed =
    sections.summary ||
    sections.impact.length ||
    sections.rootCauses.length ||
    sections.steps.length

  return hasParsed ? sections : null
}

function CollapsibleSection({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  badge,
  badgeBg,
  badgeColor,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          open
            ? 'bg-background border-b border-border/50'
            : 'bg-muted/30 hover:bg-muted/50'
        )}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon size={14} style={{ color: iconColor }} />
        </div>

        <span className="text-xs font-medium text-foreground flex-1">{title}</span>

        {badge && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full mr-1"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {badge}
          </span>
        )}

        <ChevronDown
          size={14}
          className={cn(
            'text-muted-foreground transition-transform duration-200 flex-shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="px-4 py-3 bg-background">
          {children}
        </div>
      )}
    </div>
  )
}

function SummaryBody({ text }) {
  return (
    <p className="text-xs leading-relaxed text-foreground/80">{text}</p>
  )
}

function RootCausesBody({ items }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((cause, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
            style={{ background: '#EEEDFE', color: '#534AB7' }}
          >
            {i + 1}
          </span>
          <span className="text-xs text-foreground/80 leading-relaxed">{cause}</span>
        </div>
      ))}
    </div>
  )
}

function ImpactBody({ items }) {
  const dotColors = ['#E24B4A', '#EF9F27', '#EF9F27', '#639922', '#639922']
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
            style={{ background: dotColors[i] || '#888780' }}
          />
          <span className="text-xs text-foreground/80 leading-relaxed">{item}</span>
        </div>
      ))}
    </div>
  )
}

function StepsBody({ items }) {
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {items.map((step, i) => (
        <div key={i} className="flex gap-3 items-start py-2 first:pt-0 last:pb-0">
          <span className="text-[10px] font-medium text-muted-foreground min-w-[20px] mt-0.5">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-xs text-foreground/80 leading-relaxed">{step}</span>
        </div>
      ))}
    </div>
  )
}

function RemediationBody({ items }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
            style={{ background: '#1D9E75' }}
          />
          <span className="text-xs text-foreground/80 leading-relaxed">{item}</span>
        </div>
      ))}
    </div>
  )
}

function ConfidenceBody({ value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: value,
            background: '#534AB7',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}

function ParsedView({ sections }) {
  return (
    <div className="flex flex-col gap-2">
      {sections.summary && (
        <CollapsibleSection
          icon={FileText}
          iconBg="#EEEDFE"
          iconColor="#534AB7"
          title="Incident Summary"
          defaultOpen={true}
        >
          <SummaryBody text={sections.summary} />
        </CollapsibleSection>
      )}

      {sections.rootCauses.length > 0 && (
        <CollapsibleSection
          icon={GitBranch}
          iconBg="#FAECE7"
          iconColor="#993C1D"
          title="Probable Root Causes"
          badge={`${sections.rootCauses.length} causes`}
          badgeBg="#FAECE7"
          badgeColor="#993C1D"
          defaultOpen={true}
        >
          <RootCausesBody items={sections.rootCauses} />
        </CollapsibleSection>
      )}

      {sections.impact.length > 0 && (
        <CollapsibleSection
          icon={AlertTriangle}
          iconBg="#FAEEDA"
          iconColor="#854F0B"
          title="Potential Impact"
          badge={`${sections.impact.length} risks`}
          badgeBg="#FAEEDA"
          badgeColor="#854F0B"
        >
          <ImpactBody items={sections.impact} />
        </CollapsibleSection>
      )}

      {sections.steps.length > 0 && (
        <CollapsibleSection
          icon={ListChecks}
          iconBg="#E6F1FB"
          iconColor="#185FA5"
          title="Investigation Steps"
          badge={`${sections.steps.length} steps`}
          badgeBg="#E6F1FB"
          badgeColor="#185FA5"
          defaultOpen={true}
        >
          <StepsBody items={sections.steps} />
        </CollapsibleSection>
      )}

      {sections.remediation.length > 0 && (
        <CollapsibleSection
          icon={Wrench}
          iconBg="#E1F5EE"
          iconColor="#0F6E56"
          title="Suggested Remediation"
          badge={`${sections.remediation.length} actions`}
          badgeBg="#E1F5EE"
          badgeColor="#0F6E56"
        >
          <RemediationBody items={sections.remediation} />
        </CollapsibleSection>
      )}

      {sections.confidence && (
        <CollapsibleSection
          icon={BarChart2}
          iconBg="#F1EFE8"
          iconColor="#5F5E5A"
          title="Confidence"
        >
          <ConfidenceBody value={sections.confidence} />
        </CollapsibleSection>
      )}
    </div>
  )
}

export default function AiAlarmAnalysisDialog({
  open,
  onOpenChange,
  alarm,
  loading,
  error,
  result,
  copied,
  onCopy,
  onRetry,
  onClose,
}) {
  const parsed = parseAiOutput(result)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">

        {/* Header */}
        <DialogHeader className="px-5 py-3.5 border-b border-border/50 flex-row items-center justify-between space-y-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-sm font-medium">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#EEEDFE' }}
            >
              <Bot size={14} style={{ color: '#534AB7' }} />
            </div>
            AI Incident Solve
          </DialogTitle>
        </DialogHeader>

        {/* Alarm meta bar */}
        {alarm && (
          <div className="px-5 py-2 border-b border-border/50 bg-muted/20 flex items-center gap-4 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Server size={12} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Host</span>
              <span className="text-[11px] font-medium">{alarm.host || 'N/A'}</span>
            </div>
            <div className="w-px h-3 bg-border/60" />
            <div className="flex items-center gap-1.5">
              <Tag size={12} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Event</span>
              <span className="text-[11px] font-medium">{alarm.id || alarm.eventid || 'N/A'}</span>
            </div>
            <div className="w-px h-3 bg-border/60" />
            <span className="text-[11px] text-muted-foreground truncate max-w-xs">
              {alarm.problem || 'No problem summary available.'}
            </span>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 size={18} className="animate-spin" style={{ color: '#534AB7' }} />
              <p className="text-xs">Generating structured analysis with Gemini...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 px-4 py-3 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
              {alarm && (
                <Button variant="outline" size="sm" onClick={onRetry} className="self-start text-xs h-7">
                  Retry
                </Button>
              )}
            </div>
          )}

          {!loading && !error && result && parsed && (
            <ParsedView sections={parsed} />
          )}

          {/* Raw fallback if markdown parsing fails */}
          {!loading && !error && result && !parsed && (
            <pre className="whitespace-pre-wrap break-words text-xs font-mono leading-relaxed bg-muted/30 border rounded-lg p-4 text-foreground overflow-y-auto max-h-[55vh]">
              {result}
            </pre>
          )}

          {!loading && !error && !result && (
            <p className="text-xs text-muted-foreground">
              No AI output available yet. Try running the analysis again.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between bg-muted/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            {result && (
              <>
                <Button variant="outline" size="sm" onClick={onCopy} className="h-7 text-xs gap-1.5">
                  <Copy size={11} />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm" onClick={onRetry} className="h-7 text-xs gap-1.5">
                  <RefreshCw size={11} />
                  Refresh
                </Button>
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs text-muted-foreground">
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}