"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AuthCallback() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started, current URL:', window.location.href);

        // First, check if we have hash or query parameters (OAuth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)

        const hasAuthParams = hashParams.has('access_token') ||
          hashParams.has('code') ||
          queryParams.has('code') ||
          hashParams.has('error') ||
          queryParams.has('error')

        console.log('Has auth params:', hasAuthParams);
        console.log('Hash params:', Object.fromEntries(hashParams));
        console.log('Query params:', Object.fromEntries(queryParams));

        // If we have OAuth parameters, wait a bit for Supabase to process them
        if (hasAuthParams) {
          console.log('OAuth parameters detected, waiting for Supabase to process...');
          // Give Supabase's detectSessionInUrl time to process the callback
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Check for OAuth errors
        const error = hashParams.get('error') || queryParams.get('error')
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')

        if (error) {
          console.error('OAuth error:', error, errorDescription)
          toast.error(errorDescription || 'Authentication failed. Please try again.')
          router.push('/signin?error=oauth_error')
          return
        }

        // Now get the session
        const { data, error: sessionError } = await supabase.auth.getSession()

        console.log('Session data:', data);
        console.log('Session error:', sessionError);

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
          console.log('No session found after OAuth callback');
          // If we had auth params but no session, something went wrong
          if (hasAuthParams) {
            console.error('OAuth callback completed but no session was created');
            toast.error('Authentication failed. Please try signing in again.')
            router.push('/signin?error=no_session_created')
          } else {
            // No auth params and no session, just redirect to signin
            router.push('/signin')
          }
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        toast.error('An unexpected error occurred. Please try again.')
        router.push('/signin?error=unexpected_error')
      } finally {
        setIsProcessing(false)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-800 font-medium text-lg">Completing authentication...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we sign you in</p>
      </div>
    </div>
  )
}