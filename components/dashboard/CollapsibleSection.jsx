"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
  className,
  contentClassName
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <div className="flex flex-col">
          <span className="text-lg font-semibold md:text-xl">{title}</span>
          {subtitle ? <span className="text-sm text-muted-foreground">{subtitle}</span> : null}
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0'
          )}
          aria-hidden="true"
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-[999px]' : 'max-h-0'
        )}
      >
        <div className={cn('border-t px-5 pb-5 pt-4', contentClassName)}>
          {children}
        </div>
      </div>
    </section>
  )
}

