"use client"

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useSystemSelectionStore } from '@/lib/stores/systemSelectionStore'
import { useTranslations } from 'next-intl'

const StatusBadge = ({ status }) => {
  const cls = useMemo(() => {
    switch (status) {
      case 'Normal':
        return 'bg-green-500 text-white'
      case 'Critical':
        return 'bg-red-500 text-white'
      case 'Major':
        return 'bg-orange-500 text-white'
      case 'Minor':
        return 'bg-blue-500 text-white'
      case 'Information':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }, [status])
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status || 'Unknown'}
    </span>
  )
}

export default function SystemTopbar({ systemId }) {
  const t = useTranslations('DetailedSystem.topbar')
  const { systemsById } = useSystemSelectionStore()
  const system = systemsById[systemId]

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('systemName')}</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {system?.name || systemId}
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('currentStatus')}</div>
            <div>
              <StatusBadge status={system?.status} />
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-neutral-800" />

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">Ping</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('inventory')}</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('download')}</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('export')}</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('report')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


