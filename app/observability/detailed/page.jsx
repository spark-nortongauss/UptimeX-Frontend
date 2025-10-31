"use client"

import { useEffect, useMemo, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { zabbixService } from '@/lib/services/zabbixService'
import { useZabbixStore } from '@/lib/stores/zabbixStore'
import { geocodingService } from '@/lib/services/geocodingService'

// Status badge component with color coding
const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
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
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
      {status}
    </span>
  )
}

export default function DetailedPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const { problems, fetchProblems } = useZabbixStore()

  // Determine highest severity per host and map to page status
  const hostIdToStatus = useMemo(() => {
    const severityByHost = new Map()
    for (const alarm of problems) {
      if (!alarm.hostId) continue
      const current = severityByHost.get(alarm.hostId) ?? -1
      severityByHost.set(alarm.hostId, Math.max(current, alarm.severityValue ?? 0))
    }
    const map = new Map()
    severityByHost.forEach((sev, hostId) => {
      if (sev >= 4) map.set(hostId, 'Critical')
      else if (sev === 3) map.set(hostId, 'Major')
      else map.set(hostId, 'Normal') // Minor and below => Normal
    })
    return map
  }, [problems])

  // Fetch Zabbix inventory and alarms
  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        console.log('Starting to load systems data...')
        setLoading(true)
        
        // Ensure alarms are available to derive status
        await fetchProblems({ limit: 200 })

        // Fetch inventory, SLA (Actual/Target), and created-at in parallel
        const [invRes, slaRes, createdRes] = await Promise.all([
          zabbixService.getHostsInventory(),
          zabbixService.getUptimeFromProblems({}),
          zabbixService.getHostsCreatedAt()
        ])
        
        console.log('Inventory response:', invRes)
        console.log('SLA response:', slaRes)
        
        // Create maps for SLA and created-at
        const sloTargetMap = new Map()
        const sliMap = new Map()
        const createdAtMap = new Map()
        if (slaRes?.success && slaRes?.data?.hosts) {
          slaRes.data.hosts.forEach(host => {
            if (host.hostid) {
              if (host.slaTarget !== undefined && host.slaTarget !== null) {
                sloTargetMap.set(host.hostid, host.slaTarget)
              }
              if (host.actualUptime !== undefined && host.actualUptime !== null) {
                sliMap.set(host.hostid, host.actualUptime)
              }
            }
          })
          console.log('Target SLA Map:', sloTargetMap)
          console.log('Actual SLA Map:', sliMap)
        }
        if (createdRes?.success && Array.isArray(createdRes.data)) {
          createdRes.data.forEach(row => {
            if (!row || !row.hostid) return
            const ts = row.createdAtTs
            if (ts && Number.isFinite(Number(ts))) createdAtMap.set(row.hostid, Number(ts))
          })
        }
        
        if (invRes?.success && Array.isArray(invRes.data)) {
          console.log('Processing', invRes.data.length, 'hosts')
          
          const systemsWithCoords = invRes.data.map((h, idx) => {
            const hostid = h.hostid || h.host?.hostid || `UNKNOWN-${idx}`
            const inv = h.inventory || {}
            const lat = inv.location_lat
            const lon = inv.location_lon
            const status = hostIdToStatus.get(hostid) || 'Normal'
            const sloTarget = sloTargetMap.get(hostid) || null
            const sli = sliMap.get(hostid) || null
            const ts = createdAtMap.get(hostid)
            const createdAtStr = ts ? new Date(ts * 1000).toISOString().slice(0, 10) : ''
            return {
              id: hostid,
              name: inv.name || h.name || h.host || 'Unknown',
              status,
              targetSla: sloTarget !== null ? `${sloTarget}%` : '',
              achievedSla: sli !== null ? `${sli.toFixed(2)}%` : '',
              type: inv.type_full || 'DAS',
              location: 'Location Not Available',
              coordinates: lat && lon ? { lat, lon } : null,
              createdAt: createdAtStr,
            }
          })
          
          // Second pass: geocode coordinates to real locations
          console.log('Starting geocoding for', systemsWithCoords.filter(s => s.coordinates).length, 'systems')
          const geocodedSystems = await Promise.all(
            systemsWithCoords.map(async (system) => {
              if (system.coordinates) {
                try {
                  const realLocation = await geocodingService.getLocationName(
                    system.coordinates.lat, 
                    system.coordinates.lon
                  )
                  console.log(`Geocoded ${system.coordinates.lat},${system.coordinates.lon} -> ${realLocation}`)
                  return {
                    ...system,
                    location: realLocation
                  }
                } catch (error) {
                  console.warn(`Geocoding failed for ${system.id}:`, error)
                  return system
                }
              }
              return system
            })
          )
          
          console.log('Geocoded systems:', geocodedSystems)
          if (mounted) {
            setSystems(geocodedSystems)
            setLoading(false)
          }
        } else {
          console.log('No valid data in response:', invRes)
          if (mounted) setLoading(false)
        }
      } catch (e) {
        console.error('Failed loading detailed systems:', e)
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [fetchProblems])

  // Update systems status when problems change
  useEffect(() => {
    if (systems.length > 0) {
      const updatedSystems = systems.map(system => ({
        ...system,
        status: hostIdToStatus.get(system.id) || 'Normal'
      }))
      setSystems(updatedSystems)
    }
  }, [hostIdToStatus])

  const filteredSystems = useMemo(() => {
    if (!searchTerm) return systems
    const term = searchTerm.toLowerCase()
    return systems.filter(system =>
      String(system.id).toLowerCase().includes(term) ||
      String(system.name).toLowerCase().includes(term)
    )
  }, [searchTerm, systems])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">SELECT THE SYSTEM</h1>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter the system name or ID"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full max-w-md px-4 py-3 text-base sm:text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                </div>
              </div>
            ) : filteredSystems.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-600 text-lg">No systems found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm ? 'Try adjusting your search terms' : 'No data available from Zabbix'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        System ID
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        System Name
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Current Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Target SLA
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Achieved SLA
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        System Type
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        System Location
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSystems.map((system) => (
                      <tr key={system.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                          <div className="truncate">{system.id}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="truncate">{system.name}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <StatusBadge status={system.status} />
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="truncate">{system.targetSla}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="truncate">{system.achievedSla}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="truncate">{system.type}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="truncate" title={system.location}>{system.location}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                          <div className="truncate">{system.createdAt}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mobile Card View for very small screens */}
          <div className="block sm:hidden mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                  <p className="text-gray-500 text-xs mt-1">Converting coordinates...</p>
                </div>
              </div>
            ) : filteredSystems.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-gray-600">No systems found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm ? 'Try adjusting your search terms' : 'No data available'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSystems.map((system) => (
                  <div key={system.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{system.id}</h3>
                        <p className="text-xs text-gray-600 truncate">{system.name}</p>
                      </div>
                      <div className="ml-2 shrink-0">
                        <StatusBadge status={system.status} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Target SLA:</span>
                        <p className="font-medium truncate">{system.targetSla}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Achieved SLA:</span>
                        <p className="font-medium truncate">{system.achievedSla}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium truncate">{system.type}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium text-xs">{system.createdAt}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 truncate">Location: {system.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}