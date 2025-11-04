"use client"

import AuthGuard from '@/components/AuthGuard'
import SectionHeader from '@/components/dashboard/SectionHeader'
import SystemHealthCards from '@/components/dashboard/SystemHealthCards'
import TemperatureChart from '@/components/dashboard/TemperatureChart'
import NetworkConnectivityCharts from '@/components/dashboard/NetworkConnectivityCharts'
import RFMetrics from '@/components/dashboard/RFMetrics'
import OpticalCharts from '@/components/dashboard/OpticalCharts'
import SystemTopbar from '@/components/observability/SystemTopbar'
import { useSystemSelectionStore } from '@/lib/stores/systemSelectionStore'
import { useEffect, useMemo } from 'react'
import { zabbixService } from '@/lib/services/zabbixService'

export default function DetailedSystemPage({ params }) {
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

        const systemData = {
          id: String(id),
          name: inventory.name || inv.name || inv.host || 'Unknown',
          status: 'Normal',
          targetSla: slaHost?.slaTarget !== undefined && slaHost?.slaTarget !== null ? `${slaHost.slaTarget}%` : '',
          achievedSla: slaHost?.actualUptime !== undefined && slaHost?.actualUptime !== null ? `${Number(slaHost.actualUptime).toFixed(2)}%` : '',
          type: inventory.type_full || 'DAS',
          location: 'Location Not Available',
          coordinates: lat && lon ? { lat, lon } : null,
          createdAt: createdAtStr,
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

  return (
    <AuthGuard>
      <div className="space-y-8">

        {/* Top bar with system name, status and quick actions */}
        <SystemTopbar systemId={id} />

        {/* 6. SYSTEM HEALTH CARDS */}
        <SystemHealthCards availability={availability} />

        {/* 7. TEMPERATURE MONITORING CHART */}
        <TemperatureChart />

        {/* 8. WAN LINK STATUS HEADER */}
        <SectionHeader title="WAN LINK" subtitle="STATUS" />

        {/* 9. NETWORK CONNECTIVITY CHARTS */}
        <NetworkConnectivityCharts />

        {/* 10. RF STATUS HEADER */}
        <SectionHeader title="SYSTEM RF" subtitle="STATUS" />

        {/* 11. RF POWER METRICS */}
        <RFMetrics />

        {/* 12. OPTICAL STATUS HEADER */}
        <SectionHeader title="SYSTEM OPTICAL" subtitle="STATUS" />

        {/* 13. OPTICAL SIGNAL CHARTS */}
        <OpticalCharts />
      </div>
    </AuthGuard>
  )
}