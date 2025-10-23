"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"

const HIDE_SIDEBAR_ROUTES = new Set(["/", "/signin", "/signup", "/forgot-password", "/auth/reset-password"]) 

export default function AppShell({ children }) {
  const pathname = usePathname()
  const hideSidebar = HIDE_SIDEBAR_ROUTES.has(pathname || "/")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  if (hideSidebar) return children

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="pt-14 flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        <main className={`flex-1 min-w-0 transition-all duration-300 ease-out ${
          isSidebarCollapsed ? 'ml-0' : ''
        }`}>
          <div className="mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


