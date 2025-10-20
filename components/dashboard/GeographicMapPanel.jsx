"use client"

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'

// Dynamically import the map with SSR disabled
const DeviceMap = dynamic(() => import('./DeviceMap'), { ssr: false })

export default function GeographicMapPanel() {
  const [zoom, setZoom] = useState(2)

  const dummyDevices = useMemo(
    () => [
      { id: 'us-nyc-1', name: 'NYC Edge-1', status: 'active', lat: 40.7128, lng: -74.006 },
      { id: 'uk-ldn-1', name: 'London Core', status: 'warning', lat: 51.5074, lng: -0.1278 },
      { id: 'jp-tyo-1', name: 'Tokyo POP', status: 'active', lat: 35.6762, lng: 139.6503 },
      { id: 'br-sp-1', name: 'São Paulo', status: 'error', lat: -23.5505, lng: -46.6333 },
      { id: 'in-del-1', name: 'Delhi Hub', status: 'active', lat: 28.6139, lng: 77.209 },
      { id: 'za-jnb-1', name: 'Johannesburg', status: 'active', lat: -26.2041, lng: 28.0473 },
      { id: 'au-syd-1', name: 'Sydney', status: 'warning', lat: -33.8688, lng: 151.2093 },
    ],
    []
  )

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Overall Network Status</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(2, z - 1))}>-</Button>
          <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(12, z + 1))}>+</Button>
        </div>
      </div>
      <div className="relative" style={{ height: 420 }}>
        <DeviceMap devices={dummyDevices} zoom={zoom} />
      </div>
    </div>
  )
}
