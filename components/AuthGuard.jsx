"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { toast } from 'sonner'

export default function AuthGuard({ children, fallback = null }) {
  const { user, loading, initialized } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to initialize
    if (!initialized) return

    // If not loading and no user, redirect to signin
    if (!loading && !user) {
      toast.error("Please sign in to access this page")
      router.push('/signin')
    }
  }, [user, loading, initialized, router])

  // Show loading state while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user after loading, show fallback or nothing
  if (!user) {
    return fallback
  }

  // User is authenticated, render children
  return children
}
