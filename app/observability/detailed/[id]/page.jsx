"use client"

import AuthGuard from '@/components/AuthGuard'
import SystemHealthCards from '@/components/dashboard/SystemHealthCards'
import TemperatureChart from '@/components/dashboard/TemperatureChart'
import NetworkConnectivityCharts from '@/components/dashboard/NetworkConnectivityCharts'
import RFMetrics from '@/components/dashboard/RFMetrics'
import OpticalCharts from '@/components/dashboard/OpticalCharts'
import CollapsibleSection from '@/components/dashboard/CollapsibleSection'
import SystemTopbar from '@/components/observability/SystemTopbar'
import TimeframeFilter from '@/components/observability/TimeframeFilter'
import { useSystemSelectionStore } from '@/lib/stores/systemSelectionStore'
import { useEffect, useMemo, use, useRef, useCallback } from 'react'
import { zabbixService } from '@/lib/services/zabbixService'
import { useTranslations } from 'next-intl'
import geocodingService from '@/lib/services/geocodingService'

export default function DetailedSystemPage({ params }) {
  const headerTranslations = useTranslations('DetailedSystem.headers')
  const tempTranslations = useTranslations('DetailedSystem.temperature')
  const healthTranslations = useTranslations('Overview.health')
  const resolvedParams = use(params)
  const { id } = resolvedParams || {}
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

  // Create refs for all chart components (DOM refs for html2canvas)
  const healthCardsRef = useRef(null)
  const temperatureChartRef = useRef(null)
  
  // Network charts DOM refs
  const networkChartsRefs = {
    icmp: useRef(null),
    latency: useRef(null),
    loss: useRef(null),
  }
  
  // RF metrics DOM refs (3 sectors, each with power card, TX chart, RX chart)
  const rfMetricsRefs = {
    sector1: {
      powerCard: useRef(null),
      txChart: useRef(null),
      rxChart: useRef(null),
    },
    sector2: {
      powerCard: useRef(null),
      txChart: useRef(null),
      rxChart: useRef(null),
    },
    sector3: {
      powerCard: useRef(null),
      txChart: useRef(null),
      rxChart: useRef(null),
    },
  }
  
  // Optical charts DOM refs (PD and LD for each of 3 sectors)
  const opticalChartsRefs = {
    pdSector1: useRef(null),
    pdSector2: useRef(null),
    pdSector3: useRef(null),
    ldSector1: useRef(null),
    ldSector2: useRef(null),
    ldSector3: useRef(null),
  }

  // Chart instance refs for fast ApexChart export (FAST - instant export)
  const temperatureChartInstanceRef = useRef(null)
  const networkChartInstanceRefs = {
    icmp: useRef(null),
    latency: useRef(null),
    loss: useRef(null),
  }
  const rfChartInstanceRefs = {
    sector1: {
      txChart: useRef(null),
      rxChart: useRef(null),
    },
    sector2: {
      txChart: useRef(null),
      rxChart: useRef(null),
    },
    sector3: {
      txChart: useRef(null),
      rxChart: useRef(null),
    },
  }
  const opticalChartInstanceRefs = {
    pdSector1: useRef(null),
    pdSector2: useRef(null),
    pdSector3: useRef(null),
    ldSector1: useRef(null),
    ldSector2: useRef(null),
    ldSector3: useRef(null),
  }

  // Combine all refs for SystemTopbar
  const allChartRefs = useMemo(() => ({
    healthCards: healthCardsRef,
    temperatureChart: temperatureChartRef,
    networkCharts: networkChartsRefs,
    rfMetrics: rfMetricsRefs,
    opticalCharts: opticalChartsRefs,
    // Chart instances for fast export
    chartInstances: {
      temperature: temperatureChartInstanceRef,
      network: networkChartInstanceRefs,
      rf: rfChartInstanceRefs,
      optical: opticalChartInstanceRefs,
    },
  }), [])

  return (
    <AuthGuard>
      <div className="space-y-8">

        {/* Top bar with system name, status and quick actions */}
        <SystemTopbar systemId={id} chartRefs={allChartRefs} />

        {/* Timeframe Filter */}
        <TimeframeFilter />

        {/* 6. SYSTEM HEALTH CARDS */}
        <CollapsibleSection
          title={`${healthTranslations('overallStatus')} / ${healthTranslations('overallAvailability')}`}
          subtitle={headerTranslations('status')}
        >
          <SystemHealthCards ref={healthCardsRef} availability={availability} targetSla={targetSla} />
        </CollapsibleSection>

        {/* 7. TEMPERATURE MONITORING CHART */}
        <CollapsibleSection title={tempTranslations('title')} subtitle={headerTranslations('status')}>
          <TemperatureChart 
            ref={temperatureChartRef} 
            chartInstanceRef={temperatureChartInstanceRef} 
            showTitle={false} 
          />
        </CollapsibleSection>

        {/* 8 & 9. WAN LINK STATUS AND CHARTS */}
        <CollapsibleSection
          title={`${headerTranslations('wanLink')} ${headerTranslations('status')}`}
        >
          <NetworkConnectivityCharts 
            chartRefs={networkChartsRefs} 
            chartInstanceRefs={networkChartInstanceRefs} 
          />
        </CollapsibleSection>

        {/* 10 & 11. RF STATUS AND METRICS */}
        <CollapsibleSection
          title={`${headerTranslations('systemRf')} ${headerTranslations('status')}`}
        >
          <RFMetrics 
            chartRefs={rfMetricsRefs} 
            chartInstanceRefs={rfChartInstanceRefs} 
          />
        </CollapsibleSection>

        {/* 12 & 13. OPTICAL STATUS AND CHARTS */}
        <CollapsibleSection
          title={`${headerTranslations('systemOptical')} ${headerTranslations('status')}`}
        >
          <OpticalCharts 
            chartRefs={opticalChartsRefs} 
            chartInstanceRefs={opticalChartInstanceRefs} 
          />
        </CollapsibleSection>
      </div>
    </AuthGuard>
  )
}