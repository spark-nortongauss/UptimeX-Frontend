"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Menu, X, Shield, BarChart3, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { SOLUTION_SECTIONS } from "@/lib/solutionsCatalog"

const smoothScrollTo = (sectionId) => {
  const el = document.getElementById(sectionId)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations("Header")

  return (
    <header className="fixed top-0 w-full border-b border-white/10 z-50" style={{ backgroundColor: "#3E6E70" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center pt-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <img
                src="/assets/observone_logo_1080p.png"
                alt="ObservOne logo"
                className="h-[60px] sm:h-[80px] w-auto object-contain"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="bg-transparent">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/80 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white">
                    {t("solutions")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-card border border-border">
                    <div className="w-[min(92vw,920px)] p-4 bg-card">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/solutions"
                          className="mb-4 flex select-none items-center gap-3 rounded-lg border border-border bg-gradient-to-r from-[#2D4344]/90 to-[#4D6869]/90 p-4 text-left no-underline outline-none transition-opacity hover:opacity-95 focus:shadow-md"
                        >
                          <LayoutGrid className="h-8 w-8 shrink-0 text-white" />
                          <div>
                            <div className="text-base font-semibold text-white">{t("solutions_overview")}</div>
                            <p className="text-sm text-white/90">{t("solutions_overview_desc")}</p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {SOLUTION_SECTIONS.map(({ id, headerPrefix, Icon }) => (
                          <NavigationMenuLink key={id} asChild>
                            <Link
                              href={`/solutions#${id}`}
                              className="flex gap-3 rounded-md border border-transparent p-3 no-underline outline-none transition-colors hover:border-border hover:bg-secondary focus-visible:border-border focus-visible:bg-secondary"
                            >
                              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ng-teal dark:text-ng-yellow" />
                              <div className="min-w-0 space-y-1">
                                <div className="text-sm font-medium leading-tight text-foreground">
                                  {t(`${headerPrefix}_title`)}
                                </div>
                                <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
                                  {t(`${headerPrefix}_desc`)}
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => smoothScrollTo("pricing")}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer select-none"
                  >
                    {t("pricing")}
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    onClick={() => smoothScrollTo("about")}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer select-none"
                  >
                    {t("about")}
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA */}
          <motion.div
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button asChild className="bg-ng-yellow text-black hover:opacity-90 px-6 py-2 font-semibold shadow-lg transition-all duration-300">
              <Link href="/signin">Access Platform</Link>
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-white/10" style={{ backgroundColor: "#3E6E70" }}>
              <div className="px-3 py-2">
                <div className="text-base font-medium text-white mb-2">{t("solutions")}</div>
                <Link
                  href="/solutions"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-ng-yellow hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("solutions_overview")}
                </Link>
                <div className="mt-1 max-h-[50vh] overflow-y-auto space-y-0.5 border-l border-white/20 ml-2 pl-2">
                  {SOLUTION_SECTIONS.map(({ id, headerPrefix }) => (
                    <Link
                      key={id}
                      href={`/solutions#${id}`}
                      className="block rounded-md px-2 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t(`${headerPrefix}_title`)}
                    </Link>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { smoothScrollTo("pricing"); setIsMobileMenuOpen(false) }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-white/80 rounded-md hover:bg-white/10 hover:text-white transition-colors duration-200"
              >
                {t("pricing")}
              </button>
              <button
                onClick={() => { smoothScrollTo("about"); setIsMobileMenuOpen(false) }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-white/80 rounded-md hover:bg-white/10 hover:text-white transition-colors duration-200"
              >
                {t("about")}
              </button>
              <div className="pt-4 pb-2 border-t border-white/10">
                <Button asChild className="w-full bg-ng-yellow text-black hover:opacity-90">
                  <Link href="/signin">Access Platform</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}