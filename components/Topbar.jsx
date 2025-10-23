"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Monitor, Search, HelpCircle, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/stores/authStore"
import { toast } from "sonner"

// Thin top navigation bar shown above the sidebar layout
export default function Topbar() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()
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

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Successfully logged out")
      router.push("/signin")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

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
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        {/* Left: Logo */}
        <Link href="/observability/overview" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">UptimeX</span>
        </Link>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search or jump to..."
              className="pl-9 h-9 bg-white/70"
            />
          </div>
        </div>

        {/* Right: Help + User */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Help" onClick={() => router.push("/help")}
            className="text-gray-600 hover:text-gray-900">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              className="h-9 pl-2 pr-2 flex items-center gap-2 text-gray-700"
              onClick={() => setOpen((v) => !v)}
            >
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                {displayName?.slice(0, 2)?.toUpperCase()}
              </div>
              <span className="hidden sm:block max-w-[140px] truncate text-sm font-medium">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>

            {open && (
              <div className="absolute right-0 mt-1 w-64 rounded-md border bg-white shadow-md p-2">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                <div className="my-2 h-px bg-gray-100" />
                <div className="flex flex-col">
                  <Button variant="ghost" className="justify-start h-9" onClick={() => router.push("/alerts")}>Notifications</Button>
                  <Button variant="ghost" className="justify-start h-9" onClick={() => router.push("/settings")}>Settings</Button>
                  <Button variant="ghost" className="justify-start h-9 text-red-600 hover:text-red-700" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Log out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


