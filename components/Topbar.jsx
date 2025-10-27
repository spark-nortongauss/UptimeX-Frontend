"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Monitor, Search, HelpCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuthStore } from "@/lib/stores/authStore"

// Thin top navigation bar shown above the sidebar layout
export default function Topbar() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "User"
    )
  }, [user])

  const email = user?.email || ""

  // Logout is now handled in the sidebar footer

  // Close menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <header className="fixed top-0 inset-x-0 h-14 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-40">
      <div className="h-full px-2 sm:px-4 lg:px-8 flex items-center gap-2 sm:gap-4">
        {/* Left: Logo */}
        <Link href="/observability/overview" className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm sm:text-base">UptimeX</span>
        </Link>

        {/* Sidebar Trigger - Now on the right of logo */}
        <SidebarTrigger className="text-gray-600 hover:text-gray-900 shrink-0" />

        {/* Center: Search - Hidden on mobile, shown on tablet+ */}
        <div className="flex-1 max-w-2xl mx-auto hidden sm:flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search or jump to..."
              className="pl-9 h-9 bg-white/70 text-sm"
            />
          </div>
        </div>

        {/* Right: Help + User */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Help button - Hidden on very small screens */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Help" 
            onClick={() => router.push("/help")}
            className="text-gray-600 hover:text-gray-900 hidden xs:flex"
          >
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              className="h-8 sm:h-9 pl-1 sm:pl-2 pr-1 sm:pr-2 flex items-center gap-1 sm:gap-2 text-gray-700"
              onClick={() => setOpen((v) => !v)}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                {displayName?.slice(0, 2)?.toUpperCase()}
              </div>
              <span className="hidden sm:block max-w-[100px] lg:max-w-[140px] truncate text-sm font-medium">{displayName}</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
            </Button>

            {open && (
              <div className="absolute right-0 mt-1 w-56 sm:w-64 rounded-md border bg-white shadow-md p-2 z-50">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                <div className="my-2 h-px bg-gray-100" />
                <div className="flex flex-col">
                  <Button variant="ghost" className="justify-start h-8 sm:h-9 text-sm" onClick={() => router.push("/alerts")}>Notifications</Button>
                  <Button variant="ghost" className="justify-start h-8 sm:h-9 text-sm" onClick={() => router.push("/settings")}>Settings</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}