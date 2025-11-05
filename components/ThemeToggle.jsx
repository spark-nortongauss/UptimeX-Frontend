"use client"

import { useEffect, useState } from "react"
import { useUIStore } from "@/lib/stores/uiStore"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  // Use separate selectors to avoid object recreation
  const isDark = useUIStore((state) => state.isDark)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder to avoid layout shift
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="text-gray-600 hover:text-gray-900"
      >
        <Moon className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="text-gray-600 hover:text-gray-900"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}


