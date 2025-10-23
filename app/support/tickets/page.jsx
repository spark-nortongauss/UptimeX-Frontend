"use client"

import AuthGuard from '@/components/AuthGuard'

export default function TicketsPage() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">Manage and track support tickets</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">Support tickets content will be implemented here.</p>
        </div>
      </div>
    </AuthGuard>
  )
}
