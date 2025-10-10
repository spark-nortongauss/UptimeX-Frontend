"use client"

import AuthGuard from '@/components/AuthGuard';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-600 mt-2">Configure application settings and preferences.</p>
      </div>
    </AuthGuard>
  )
}


