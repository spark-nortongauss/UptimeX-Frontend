"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

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
          router.push('/signin?error=auth_callback_failed')
          return
        }

        if (data.session) {
          console.log('Authentication successful, redirecting to dashboard');
          // Successful authentication, redirect to dashboard
          router.push('/dashboard')
        } else {
          console.log('No session found, redirecting to signin');
          // No session found, redirect to signin
          router.push('/signin')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
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