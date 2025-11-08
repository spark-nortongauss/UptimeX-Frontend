"use client"

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapContainerRef = useRef(null)

  // Cross-browser helpers for fullscreen API
  const requestFullscreen = useCallback((el) => {
    if (!el) return
    if (el.requestFullscreen) return el.requestFullscreen()
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen()
    if (el.mozRequestFullScreen) return el.mozRequestFullScreen()
    if (el.msRequestFullscreen) return el.msRequestFullscreen()
    return Promise.resolve()
  }, [])

  const exitFullscreen = useCallback(() => {
    const d = document
    if (d.exitFullscreen) return d.exitFullscreen()
    if (d.webkitExitFullscreen) return d.webkitExitFullscreen()
    if (d.mozCancelFullScreen) return d.mozCancelFullScreen()
    if (d.msExitFullscreen) return d.msExitFullscreen()
    return Promise.resolve()
  }, [])

  const getFullscreenElement = () => (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  )

  const handleToggleFullscreen = useCallback(async () => {
    const currentFsEl = getFullscreenElement()
    const el = mapContainerRef.current
    try {
      if (!currentFsEl && el) {
        await requestFullscreen(el)
      } else {
        await exitFullscreen()
      }
    } catch (e) {
      // No-op, but ensure UI doesn't crash
      console.error('Fullscreen toggle error:', e)
    }
  }, [requestFullscreen, exitFullscreen])

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
                property_type: inv.property_type || inv.type || 'N/A',
                oem: inv.oem || inv.manufacturer || inv.hardware || inv.model || 'N/A',
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

  // Listen for fullscreen changes to keep state in sync and trigger map resize
  useEffect(() => {
    const onFsChange = () => {
      const fsEl = getFullscreenElement()
      const active = !!(fsEl && mapContainerRef.current && fsEl === mapContainerRef.current)
      setIsFullscreen(active)
      // Nudge map libraries to recalc dimensions
      setTimeout(() => {
        try { window.dispatchEvent(new Event('resize')) } catch {}
      }, 200)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('mozfullscreenchange', onFsChange)
    document.addEventListener('MSFullscreenChange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('mozfullscreenchange', onFsChange)
      document.removeEventListener('MSFullscreenChange', onFsChange)
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{t('title')}</h3>
      </div>
      <div
        ref={mapContainerRef}
        className={`relative transition-all duration-300 ease-in-out focus:outline-none ${isFullscreen ? 'bg-black' : ''}`}
        style={{ height: isFullscreen ? '100vh' : 420 }}
        tabIndex={-1}
        aria-label="Network devices map container"
        onKeyDown={(e) => {
          // Allow keyboard shortcut 'f' to toggle fullscreen when container is focused
          if (e.key === 'f' || e.key === 'F') {
            e.preventDefault()
            handleToggleFullscreen()
          }
        }}
      >
        {/* Map fullscreen control (aligned with Leaflet zoom controls in top-right) */}
        <div className="map-fullscreen-control absolute z-10">
          <Button
            type="button"
            size="icon"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen map' : 'Enter fullscreen map'}
            aria-pressed={isFullscreen}
            aria-keyshortcuts="F"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="p-0 rounded-[4px] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] focus:bg-[hsl(var(--accent))] shadow-none"
          >
            {/* Simple inline icon to avoid extra dependencies */}
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-[14px] w-[14px]"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9l-5-5m0 0v4m0-4h4M15 9l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0h4m-4 0v-4M15 15l5 5m0 0h-4m4 0v-4" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-[14px] w-[14px]"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4M8 8H4m12 0h4M8 16H4m12 0h4M8 8v-4m8 4v-4M8 16v4m8-4v4" />
              </svg>
            )}
          </Button>
        </div>
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
