"use client"

import AuthGuard from '@/components/AuthGuard';

export default function MetricsPage() {
  return (
    <AuthGuard>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Metrics</h1>
        <p className="text-gray-600 mt-2">Explore application and infrastructure metrics.</p>
      </div>
    </AuthGuard>
  )
}


