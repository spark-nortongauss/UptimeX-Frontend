"use client"

import { useAuthStore } from '@/lib/stores/authStore';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600 mt-2">Here's your monitoring overview.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Total Monitors</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Active monitoring services</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Uptime</h3>
            <p className="text-3xl font-bold text-green-600">100%</p>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Incidents</h3>
            <p className="text-3xl font-bold text-red-600">0</p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}


