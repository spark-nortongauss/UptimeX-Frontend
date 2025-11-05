"use client"

import { useEffect, useRef, useState } from "react"
import { useLocaleController } from "./IntlProvider"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

const FLAGS = {
  en: "🇬🇧",
  es: "🇪🇸",
  pt: "🇵🇹",
  fr: "🇫🇷",
  de: "🇩🇪",
}

const LABELS = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleController()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
        className="h-8 px-2 text-gray-700 dark:text-gray-200 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-neutral-800"
      >
        <span className="mr-2 text-base leading-none">{FLAGS[locale] ?? "🌐"}</span>
        <span className="text-sm font-medium">{(locale || 'en').slice(0,2).toUpperCase()}</span>
        <ChevronDown className="ml-1 h-3.5 w-3.5" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-1 z-50">
          {["en", "es", "pt", "fr", "de"].map((code) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded text-sm text-left hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                locale === code ? "bg-gray-50 dark:bg-neutral-800" : ""
              }`}
            >
              <span className="text-base leading-none">{FLAGS[code]}</span>
              <span className="flex-1">{LABELS[code]}</span>
              <span className="ml-auto inline-flex items-center justify-center rounded-sm bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 text-[10px] font-semibold px-1.5 py-0.5">
                {code.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


