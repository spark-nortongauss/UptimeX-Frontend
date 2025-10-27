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
              <div className="text-sm p-1">
                <div className="font-semibold mb-2 text-base">{d.name}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">IP:</span>
                    <span className="font-mono">{d.ip}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Port:</span>
                    <span className="font-mono">{d.port}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</span>
                  </div>
                  {d.description && (
                    <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-muted-foreground">{d.description}</span>
                    </div>
                  )}
                  <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-muted-foreground">Status: </span>
                    <span style={{ color, fontWeight: 600 }}>{d.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}


