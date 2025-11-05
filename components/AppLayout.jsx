"use client"

import Topbar from "./Topbar"
import AppSidebar from "./AppSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useUIStore } from "@/lib/stores/uiStore"

export default function AppLayout({ children }) {
  const isDark = useUIStore((state) => state.isDark)

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

