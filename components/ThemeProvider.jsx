"use client"

import { useEffect } from "react"
import { useUIStore } from "@/lib/stores/uiStore"

export default function ThemeProvider({ children }) {
  const initializeTheme = useUIStore((state) => state.initializeTheme)

  // Initialize theme on mount (only once)
  useEffect(() => {
    initializeTheme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return <>{children}</>
}


