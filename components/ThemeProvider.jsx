"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      // Use a data-attribute so we can scope the real `.dark` class locally
      // in layouts instead of applying globally on <html>
      attribute="data-mode"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}


