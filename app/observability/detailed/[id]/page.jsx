"use client"

import AuthGuard from '@/components/AuthGuard'
import SystemHealthCards from '@/components/dashboard/SystemHealthCards'
import TemperatureChart from '@/components/dashboard/TemperatureChart'
import NetworkConnectivityCharts from '@/components/dashboard/NetworkConnectivityCharts'
import RFMetrics from '@/components/dashboard/RFMetrics'
import OpticalCharts from '@/components/dashboard/OpticalCharts'
import CollapsibleSection from '@/components/dashboard/CollapsibleSection'
import SystemTopbar from '@/components/observability/SystemTopbar'
import { useSystemSelectionStore } from '@/lib/stores/systemSelectionStore'
import { useEffect, useMemo } from 'react'
import { zabbixService } from '@/lib/services/zabbixService'
import { useTranslations } from 'next-intl'
import geocodingService from '@/lib/services/geocodingService'

export default function DetailedSystemPage({ params }) {
  const headerTranslations = useTranslations('DetailedSystem.headers')
  const tempTranslations = useTranslations('DetailedSystem.temperature')
  const healthTranslations = useTranslations('Overview.health')
  const { id } = params || {}
  const { systemsById, selectSystem } = useSystemSelectionStore()
  const selected = systemsById[id]

  // On hard refresh, populate store with minimal data for this id
  useEffect(() => {
    let mounted = true
    const loadIfMissing = async () => {
      if (!id || selected) return
      try {
        const [invRes, slaRes, createdRes] = await Promise.all([
          zabbixService.getHostsInventory([id]),
          zabbixService.getUptimeFromProblems({ hostids: id }),
          zabbixService.getHostsCreatedAt([id])
        ])

        const inv = invRes?.success && Array.isArray(invRes?.data) ? invRes.data[0] : null
        const slaHost = slaRes?.success && slaRes?.data?.hosts ? slaRes.data.hosts.find(h => String(h.hostid) === String(id)) : null
        const createdRow = createdRes?.success && Array.isArray(createdRes?.data) ? createdRes.data.find(r => String(r.hostid) === String(id)) : null

        if (!inv) return
        const inventory = inv.inventory || {}
        const lat = inventory.location_lat
        const lon = inventory.location_lon
        const createdAtStr = createdRow?.createdAtTs ? new Date(Number(createdRow.createdAtTs) * 1000).toISOString().slice(0, 10) : ''

        // Geocode location if coordinates are available
        let location = 'Location Not Available'
        if (lat && lon) {
          try {
            const geocodedLocation = await geocodingService.getLocationName(lat, lon)
            location = geocodedLocation || 'Location Not Available'
          } catch (error) {
            console.warn(`Geocoding failed for ${id}:`, error)
            location = `${lat}, ${lon}` // Fallback to coordinates
          }
        }

        const systemData = {
          id: String(id),
          name: inventory.name || inv.name || inv.host || 'Unknown',
          status: 'Normal',
          targetSla: slaHost?.slaTarget !== undefined && slaHost?.slaTarget !== null ? `${slaHost.slaTarget}%` : '',
          achievedSla: slaHost?.actualUptime !== undefined && slaHost?.actualUptime !== null ? `${Number(slaHost.actualUptime).toFixed(2)}%` : '',
          type: inventory.type_full || 'DAS',
          location: location,
          coordinates: lat && lon ? { lat, lon } : null,
          createdAt: createdAtStr,
          inventory: inventory, // Store full inventory for SystemTopbar
        }
        if (mounted) selectSystem(String(id), systemData)
      } catch (e) {
        console.error('Failed to hydrate system on refresh:', e)
      }
    }
    loadIfMissing()
    return () => { mounted = false }
  }, [id, selected, selectSystem])

  const availability = useMemo(() => (
    selected?.achievedSla ? Number(String(selected.achievedSla).replace('%','')) : undefined
  ), [selected])

  const targetSla = useMemo(() => (
    selected?.targetSla || null
  ), [selected])

  return (
    <AuthGuard>
      <div className="space-y-8">

        {/* Top bar with system name, status and quick actions */}
        <SystemTopbar systemId={id} />

        {/* 6. SYSTEM HEALTH CARDS */}
        <CollapsibleSection
          title={`${healthTranslations('overallStatus')} / ${healthTranslations('overallAvailability')}`}
          subtitle={headerTranslations('status')}
        >
          <SystemHealthCards availability={availability} targetSla={targetSla} />
        </CollapsibleSection>

        {/* 7. TEMPERATURE MONITORING CHART */}
        <CollapsibleSection title={tempTranslations('title')} subtitle={headerTranslations('status')}>
          <TemperatureChart showTitle={false} />
        </CollapsibleSection>

        {/* 8 & 9. WAN LINK STATUS AND CHARTS */}
        <CollapsibleSection
          title={`${headerTranslations('wanLink')} ${headerTranslations('status')}`}
        >
          <NetworkConnectivityCharts />
        </CollapsibleSection>

        {/* 10 & 11. RF STATUS AND METRICS */}
        <CollapsibleSection
          title={`${headerTranslations('systemRf')} ${headerTranslations('status')}`}
        >
          <RFMetrics />
        </CollapsibleSection>

        {/* 12 & 13. OPTICAL STATUS AND CHARTS */}
        <CollapsibleSection
          title={`${headerTranslations('systemOptical')} ${headerTranslations('status')}`}
        >
          <OpticalCharts />
        </CollapsibleSection>
      </div>
    </AuthGuard>
  )
}