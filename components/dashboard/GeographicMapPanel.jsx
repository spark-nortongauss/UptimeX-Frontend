"use client"

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import zabbixService from '@/lib/services/zabbixService'
import { useTranslations } from 'next-intl'

// Dynamically import the map with SSR disabled and proper error handling
const DeviceMap = dynamic(() => import('./DeviceMap'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
})

export default function GeographicMapPanel() {
  const t = useTranslations('Overview.map')
  const [zoom, setZoom] = useState(2)
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await zabbixService.getHostsInventory()
        const hosts = res?.data || []
        const mapped = hosts
          .map(h => {
            const inv = h.inventory || {}
            // Some responses may have inventory as [] when empty
            const lat = parseFloat(inv.location_lat)
            const lon = parseFloat(inv.location_lon)
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              // Basic status heuristic: available 1 -> active, 2 -> warning, else default
              const iface = Array.isArray(h.interfaces) && h.interfaces.length > 0 ? h.interfaces[0] : null
              let status = 'default'
              if (iface) {
                if (iface.available === '1') status = 'active'
                else if (iface.available === '2') status = 'warning'
                else if (iface.available === '0') status = 'error'
              }
              return {
                id: h.hostid,
                name: h.name || h.host,
                status,
                lat,
                lng: lon,
                ip: iface?.ip || 'N/A',
                port: iface?.port || 'N/A',
                description: h.description || '',
                type: inv.type || 'N/A',
                type_full: inv.type_full || 'N/A',
                vendor: inv.vendor || 'N/A',
                available: iface?.available || '0',
              }
            }
            return null
          })
          .filter(Boolean)
        if (isMounted) setDevices(mapped)
      } catch (e) {
        if (isMounted) setError(e?.message || t('loadError'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{t('title')}</h3>
      </div>
      <div className="relative" style={{ height: 420 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('loadingDevices')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : (
          <DeviceMap devices={devices} zoom={zoom} />
        )}
      </div>
    </div>
  )
}
