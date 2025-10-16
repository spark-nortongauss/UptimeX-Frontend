"use client"

import { usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"

const HIDE_SIDEBAR_ROUTES = new Set(["/", "/signin", "/signup"]) 

export default function AppShell({ children }) {
  const pathname = usePathname()
  const hideSidebar = HIDE_SIDEBAR_ROUTES.has(pathname || "/")

  if (hideSidebar) return children

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="pt-14 flex">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


