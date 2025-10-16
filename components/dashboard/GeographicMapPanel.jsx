"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const markers = [
  { top: '62%', left: '22%', color: '#22c55e' }, // USA
  { top: '56%', left: '48%', color: '#eab308' }, // Europe
  { top: '68%', left: '85%', color: '#3b82f6' }, // Japan
  { top: '72%', left: '30%', color: '#ef4444' }, // Brazil
  { top: '52%', left: '80%', color: '#a855f7' }, // India
  { top: '78%', left: '60%', color: '#22c55e' }, // Africa
]

export default function GeographicMapPanel() {
  const [scale, setScale] = useState(1)

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Overall Network Status</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
          >
            -
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setScale((s) => Math.min(2, s + 0.2))}
          >
            +
          </Button>
        </div>
      </div>
      <div className="relative" style={{ height: 420 }}>
        <div 
          className="absolute inset-0" 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center' 
          }}
        >
          <img 
            src="/globe.svg" 
            alt="map" 
            className="w-full h-full object-cover opacity-80 invert-[.85]" 
          />
          {markers.map((marker, idx) => (
            <span
              key={idx}
              className="absolute h-3 w-3 rounded-full shadow ring-2 ring-background"
              style={{ 
                top: marker.top, 
                left: marker.left, 
                backgroundColor: marker.color 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
