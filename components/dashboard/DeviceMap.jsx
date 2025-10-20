"use client"

import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo } from 'react'

const statusToColor = {
  active: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  default: '#60a5fa',
}

export default function DeviceMap({ devices, zoom = 2 }) {
  const center = useMemo(() => ({ lat: 20, lng: 0 }), [])

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
    >
      <ZoomControl position="topright" />

      {/* Dark theme tile provider similar to Grafana */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
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
              <div className="text-sm">
                <div className="font-semibold">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.lat.toFixed(3)}, {d.lng.toFixed(3)}</div>
                <div className="mt-1">
                  Status: <span style={{ color }}>{d.status}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}


