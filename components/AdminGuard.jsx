"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/authStore"
import { authService } from "@/lib/services/authService"

export default function AdminGuard({ children }) {
  const router = useRouter()
  const { getToken, initialized } = useAuthStore()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const run = async () => {
      if (!initialized) return
      const token = getToken() || await authService.getSessionToken()
      if (!token) {
        router.push('/signin')
        return
      }
      try {
        const profile = await authService.getUserProfile(token)
        const role = profile?.user?.dbUser?.role
        if (role !== 'ADMIN') {
          router.push('/observability/overview')
          return
        }
        setOk(true)
      } catch (error) {
        const status = error?.status
        if (status === 401 || status === 403) {
          router.push('/observability/overview')
          return
        }
        setOk(true)
      }
    }
    run()
  }, [initialized, getToken, router])

  if (!ok) {
    return <div className="mt-14 p-8">Loading...</div>
  }

  return children
}