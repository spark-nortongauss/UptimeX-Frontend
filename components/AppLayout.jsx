"use client"

import Topbar from "./Topbar"
import AppSidebar from "./AppSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"

export default function AppLayout({ children }) {
  const { resolvedTheme } = useTheme()
  // Compute an initial theme synchronously to avoid flash on reload
  const initialIsDark = useMemo(() => {
    if (typeof window === "undefined") return false
    try {
      const stored = localStorage.getItem("theme")
      if (stored === "dark") return true
      if (stored === "light") return false
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    } catch {
      return false
    }
  }, [])
  const [isDark, setIsDark] = useState(initialIsDark)
  useEffect(() => {
    if (resolvedTheme) setIsDark(resolvedTheme === "dark")
  }, [resolvedTheme])
  return (
    // Scope the `.dark` class to the layout area only
    <div className={isDark ? "dark" : ""}>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-neutral-950">
        <SidebarProvider>
          <Topbar />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <SidebarInset className="overflow-y-auto overflow-x-hidden">
              <div className="mt-14 p-8">
                {children}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}

