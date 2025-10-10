"use client"

import AuthGuard from '@/components/AuthGuard';

export default function DevicesPage() {
  return (
    <AuthGuard>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Devices</h1>
        <p className="text-gray-600 mt-2">Manage and view your monitored devices.</p>
      </div>
    </AuthGuard>
  )
}


