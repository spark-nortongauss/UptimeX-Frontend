"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useUIStore } from "@/lib/stores/uiStore"
import { useAuthStore } from "@/lib/stores/authStore"
import AppLayout from "./AppLayout"

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const shouldShowLayout = useUIStore((state) => state.shouldShowLayout)
  const setIsMobile = useUIStore((state) => state.setIsMobile)
  const isDark = useUIStore((state) => state.isDark)
  const { initialize, initialized } = useAuthStore()

  // Initialize on client side
  useEffect(() => {
    // Initialize auth
    if (!initialized) {
      initialize()
    }

    // Initialize mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [initialize, initialized, setIsMobile])

  // Check if current route should show layout (sidebar/topbar)
  const showLayout = shouldShowLayout(pathname || "/")

  // Apply theme to document root for auth pages too
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [isDark])

  if (!showLayout) {
    return children
  }

  return <AppLayout>{children}</AppLayout>
}

