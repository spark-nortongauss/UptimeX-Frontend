"use client"

import Topbar from "./Topbar"
import AppSidebar from "./AppSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AppLayout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <SidebarProvider>
        <Topbar />
        <div className="flex flex-1 pt-14 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="overflow-y-auto overflow-x-hidden">
            <div className="p-6">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

