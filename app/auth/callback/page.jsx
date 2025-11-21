"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started, current URL:', window.location.href);

        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession()

        console.log('Session data:', data);
        console.log('Session error:', error);

        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed. Please try again.')
          router.push('/signin?error=auth_callback_failed')
          return
        }

        if (data.session) {
          console.log('Authentication successful, checking user workspaces...');
          toast.success('Successfully signed in! Welcome back.')

          // Check if user is admin or has workspaces before redirecting
          const token = data.session.access_token
          const { authService } = await import('@/lib/services/authService')
          const { workspaceService } = await import('@/lib/services/workspaceService')

          // Check if user is admin
          const isAdmin = await authService.isAdmin(token)

          if (isAdmin) {
            // Admin users go to observability overview
            console.log('User is admin, redirecting to observability overview');
            router.push('/observability/overview')
            return
          }

          // Check if user has workspaces
          const workspaces = await workspaceService.getWorkspaces(token)

          if (!workspaces || workspaces.length === 0) {
            // No workspaces, redirect to workspace creation
            console.log('No workspaces found, redirecting to workspace creation');
            router.push('/workspace')
          } else {
            // Has workspaces, go to overview
            console.log('Workspaces found, redirecting to observability overview');
            router.push('/observability/overview')
          }
        } else {
          console.log('No session found, redirecting to signin');
          // No session found, redirect to signin
          router.push('/signin')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        toast.error('An unexpected error occurred. Please try again.')
        router.push('/signin?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}