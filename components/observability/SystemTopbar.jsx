"use client"

import { useMemo, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSystemSelectionStore } from '@/lib/stores/systemSelectionStore'
import { useTranslations } from 'next-intl'
import { Cpu } from 'lucide-react'
import { zabbixService } from '@/lib/services/zabbixService'
import geocodingService from '@/lib/services/geocodingService'

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
  const tActions = useTranslations('Overview.health')
  const { systemsById } = useSystemSelectionStore()
  const system = systemsById[systemId]
  const [inventoryData, setInventoryData] = useState(null)

  // Fetch inventory data if not already in system
  useEffect(() => {
    let mounted = true
    const loadInventory = async () => {
      if (!systemId || inventoryData || system?.inventory) return
      try {
        const invRes = await zabbixService.getHostsInventory([systemId])
        if (invRes?.success && Array.isArray(invRes.data) && invRes.data.length > 0) {
          const inv = invRes.data[0]
          if (mounted) {
            setInventoryData(inv.inventory || {})
          }
        }
      } catch (e) {
        console.error('Failed to load inventory:', e)
      }
    }
    loadInventory()
    return () => { mounted = false }
  }, [systemId, system?.inventory])

  const inventory = inventoryData || system?.inventory || {}
  const [location, setLocation] = useState(system?.location || null)
  
  // Geocode location if we have coordinates but no location yet
  useEffect(() => {
    let mounted = true
    const geocodeLocation = async () => {
      // If we already have a location from system store, use it
      if (system?.location) {
        if (mounted && location !== system.location) {
          setLocation(system.location)
        }
        return
      }
      
      // If location is already set, don't geocode again
      if (location && location !== 'N/A') {
        return
      }
      
      // If we have coordinates but no location, geocode them
      const lat = inventory.location_lat
      const lon = inventory.location_lon
      if (lat && lon) {
        try {
          const geocodedLocation = await geocodingService.getLocationName(lat, lon)
          if (mounted) {
            setLocation(geocodedLocation || `${lat}, ${lon}`)
          }
        } catch (error) {
          console.warn(`Geocoding failed in SystemTopbar:`, error)
          if (mounted) {
            setLocation(`${lat}, ${lon}`)
          }
        }
      } else {
        if (mounted && !location) {
          setLocation('N/A')
        }
      }
    }
    geocodeLocation()
    return () => { mounted = false }
  }, [system?.location, inventory.location_lat, inventory.location_lon])
  
  const systemLocation = location || 'N/A'
  
  // OEM can be in different fields - check common Zabbix inventory fields
  const oem = inventory.oem || 
              inventory.manufacturer || 
              inventory.hardware || 
              inventory.model || 
              'N/A'
  
  const systemType = inventory.type_full || system?.type || 'N/A'
  const vendor = inventory.vendor || 'N/A'
  const propertyType = inventory.property_type || inventory.type || 'N/A'

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 mb-6">
      {/* First Row: System Name, Status, and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
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

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              size="sm" 
              className="bg-lime-500 hover:bg-lime-600 text-white font-bold border-0 shadow-sm"
            >
              <Cpu className="h-4 w-4 mr-1.5" />
              AI
            </Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">Ping</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('inventory')}</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('download')}</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('export')}</Button>
            <Button size="sm" variant="outline" className="dark:hover:bg-neutral-800 dark:text-white">{t('report')}</Button>
            <Button size="sm" className="dark:hover:bg-neutral-800">{tActions('openTicket')}</Button>
          </div>
        </div>
      </div>

      {/* Second Row: System Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
        <div className="flex flex-col gap-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">System Location</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={systemLocation}>
            {systemLocation}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">OEM</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={oem}>
            {oem}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">System Type</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={systemType}>
            {systemType}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">Vendor</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={vendor}>
            {vendor}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">Property Type</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={propertyType}>
            {propertyType}
          </div>
        </div>
      </div>
    </div>
  )
}