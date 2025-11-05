"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { NextIntlClientProvider } from "next-intl"

const SUPPORTED_LOCALES = ["en", "es", "pt", "fr", "de"]

const LocaleContext = createContext({
  locale: "en",
  setLocale: () => {},
})

export function useLocaleController() {
  return useContext(LocaleContext)
}

function loadMessagesSync(locale) {
  // Keep client-only; avoid persistent locale cookies. No SSR required.
  try {
    switch (locale) {
      case "es":
        return require("../messages/es.json")
      case "pt":
        return require("../messages/pt.json")
      case "fr":
        return require("../messages/fr.json")
      case "de":
        return require("../messages/de.json")
      case "en":
      default:
        return require("../messages/en.json")
    }
  } catch (e) {
    return require("../messages/en.json")
  }
}

export default function IntlProvider({ children }) {
  const [locale, setLocaleState] = useState("en")

  const setLocale = useCallback((next) => {
    const safe = SUPPORTED_LOCALES.includes(next) ? next : "en"
    setLocaleState(safe)
  }, [])

  const messages = useMemo(() => loadMessagesSync(locale), [locale])

  const ctx = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return (
    <LocaleContext.Provider value={ctx}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}


