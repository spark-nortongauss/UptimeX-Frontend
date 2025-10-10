"use client"

import AuthGuard from '@/components/AuthGuard';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and preferences.</p>
      </div>
    </AuthGuard>
  )
}


