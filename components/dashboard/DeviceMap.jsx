"use client"

import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo, useEffect, useState } from 'react'

// Fix for default markers in production builds
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const statusToColor = {
  active: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  default: '#60a5fa',
}

const statusBadgeClass = {
  active:
    'bg-lime-400 text-gray-900',
  warning:
    'bg-yellow-300 text-gray-900',
  error:
    'bg-red-500 text-white',
  default:
    'bg-gray-300 text-gray-900',
}

export default function DeviceMap({ devices, zoom = 2 }) {
  const center = useMemo(() => ({ lat: 20, lng: 0 }), [])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      minZoom={2}
      maxZoom={16}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
      worldCopyJump
      preferCanvas
      key={`map-${zoom}`} // Force re-render on zoom change
    >
      <ZoomControl position="topright" />

      {/* Dark theme tile provider similar to Grafana */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
        maxZoom={18}
        subdomains={['a', 'b', 'c', 'd']}
      />

      {devices.map((d) => {
        const color = statusToColor[d.status] || statusToColor.default
        return (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            radius={7}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
          >
            <Popup>
              <div className="relative w-72 rounded-3xl bg-[#4a4a4a] text-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between px-4 pt-4 pb-3 bg-gradient-to-b from-[#3a3a3a] to-[#4a4a4a]">
                  <div className="pr-3">
                    <div className="text-[15px] font-semibold leading-tight">
                      {d.name}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-200 leading-snug">
                      {d.description
                        ? d.description
                        : `${d.property_type || d.type} · ${d.vendor}`}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-300">
                      Lat. {d.lat.toFixed(4)} Long. {d.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="shrink-0 mt-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${statusBadgeClass[d.status] || statusBadgeClass.default}`}
                    >
                      {d.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 py-4 bg-[#4a4a4a] text-[11px]">
                  <div className="grid grid-cols-[1.1fr_auto_1.1fr] gap-x-4">
                    {/* Left column */}
                    <div className="space-y-1.5">
                      <div>
                        <div className="text-gray-200">System Type</div>
                        <div className="text-gray-100 font-medium">
                          {d.type || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-200">Property Type</div>
                        <div className="text-gray-100 font-medium">
                          {d.property_type || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-200">System OEM</div>
                        <div className="text-gray-100 font-medium">
                          {d.oem && d.oem !== 'N/A' ? d.oem : d.vendor || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-200">Host IP</div>
                        <div className="text-gray-100 font-mono font-medium">
                          {d.ip}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-full border-l border-gray-500/60 mx-auto" />

                    {/* Right column */}
                    <div className="space-y-1.5">
                      <div>
                        <div className="text-gray-200">Last Event</div>
                        <div className="text-gray-100 font-medium">
                          {d.status.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-200">Alarm Rank</div>
                        <div className="text-gray-100 font-medium">
                          {d.type_full || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-200">Alarm Rank</div>
                        <div className="text-gray-100 font-medium">
                          {d.available === '1'
                            ? 'Online'
                            : d.available === '2'
                            ? 'Degraded'
                            : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer icons */}
                <div className="px-6 pb-4 pt-2 bg-[#4a4a4a] flex items-center justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      className="h-6 w-7 rounded-md bg-lime-300 shadow-sm"
                    />
                  ))}
                </div>

                {/* Pointer / tail */}
                <div className="absolute left-1/2 -bottom-2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#4a4a4a] shadow-[0_4px_6px_rgba(0,0,0,0.35)]" />
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}


