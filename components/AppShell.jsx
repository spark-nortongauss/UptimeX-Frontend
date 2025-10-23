"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"

const HIDE_SIDEBAR_ROUTES = new Set(["/", "/signin", "/signup", "/forgot-password", "/auth/reset-password"]) 

export default function AppShell({ children }) {
  const pathname = usePathname()
  const hideSidebar = HIDE_SIDEBAR_ROUTES.has(pathname || "/")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  if (hideSidebar) return children

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar 
        onMobileMenuToggle={toggleSidebar}
        isMobile={isMobile}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />
      <div className="pt-14 flex">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={toggleSidebar}
          isMobile={isMobile}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onCloseMobileSidebar={closeMobileSidebar}
        />
        <main className={`flex-1 min-w-0 transition-all duration-300 ease-out ${
          isSidebarCollapsed ? 'ml-0' : ''
        }`}>
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
    </div>
  )
}


