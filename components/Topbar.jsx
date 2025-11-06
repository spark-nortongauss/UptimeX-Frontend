"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, HelpCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuthStore } from "@/lib/stores/authStore"
import ThemeToggle from "@/components/ThemeToggle"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { useTranslations } from "next-intl"

// Thin top navigation bar shown above the sidebar layout
export default function Topbar() {
  const router = useRouter()
  const t = useTranslations("Topbar")
  const { user } = useAuthStore()
  const { state, isMobile } = useSidebar()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const menuRef = useRef(null)
  const searchInputRef = useRef(null)

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

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/internalsearch/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm("")
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle Enter key in search input
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e)
    }
  }

  return (
    <header className={`fixed top-0 right-0 h-14 border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 z-40 transition-[left] duration-200 ease-linear ${
      isMobile 
        ? "left-0"  // ← Remove "inset-x-0", just use "left-0"
        : state === "expanded" 
          ? "left-[16rem]" 
          : "left-[3rem]"
    }`}>
      <div className="h-full px-2 sm:px-4 lg:px-8 flex items-center gap-2 sm:gap-4">
        {/* Center: Search - Hidden on mobile, shown on tablet+ */}
        <div className="flex-1 max-w-2xl mx-auto hidden sm:flex items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 h-9 bg-white/70 dark:bg-neutral-800/70 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-neutral-700"
            />
          </form>
        </div>

        {/* Right: Language + Theme + Help + User */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {/* Help button - Hidden on very small screens */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label={t("help")}
            onClick={() => router.push("/help")}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hidden xs:flex"
          >
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              className="h-8 sm:h-9 pl-1 sm:pl-2 pr-1 sm:pr-2 flex items-center gap-1 sm:gap-2 text-gray-700 dark:text-gray-200"
              onClick={() => setOpen((v) => !v)}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                {displayName?.slice(0, 2)?.toUpperCase()}
              </div>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
            </Button>

            {open && (
              <div className="absolute right-0 mt-1 w-56 sm:w-64 rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md p-2 z-50">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
                </div>
                <div className="my-2 h-px bg-gray-100 dark:bg-neutral-800" />
                <div className="flex flex-col">
                  <Button variant="ghost" className="justify-start h-8 sm:h-9 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800" onClick={() => router.push("/alerts")}>{t("notifications")}</Button>
                  <Button variant="ghost" className="justify-start h-8 sm:h-9 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800" onClick={() => router.push("/settings")}>{t("settings")}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}