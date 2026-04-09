"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Menu, X, Monitor, Shield, BarChart3, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { SOLUTION_SECTIONS } from "@/lib/solutionsCatalog"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations("Header")

  return (
    <header className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
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
                className="h-[48px] w-auto object-contain"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="bg-background">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-background text-muted-foreground hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground data-[state=open]:bg-secondary">
                    {t("products")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-card border border-border">
                    <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-card">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <div
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-[#2D4344] to-[#4D6869] p-6 no-underline outline-none focus:shadow-md cursor-not-allowed pointer-events-none"
                            aria-disabled="true"
                            role="link"
                            tabIndex={-1}
                          >
                            <Monitor className="h-6 w-6 text-white" />
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              {t("platform")}
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              {t("platform_desc")}
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                      <div className="grid gap-3">
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground cursor-not-allowed pointer-events-none bg-card" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-ng-teal dark:text-ng-yellow" />
                              <div className="text-sm font-medium leading-none text-foreground">{t("monitoring")}</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("monitoring_desc")}
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground cursor-not-allowed pointer-events-none bg-card" aria-disabled="true" role="link" tabIndex={-1}>
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-ng-teal dark:text-ng-yellow" />
                              <div className="text-sm font-medium leading-none text-foreground">{t("security")}</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("security_desc")}
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-background text-muted-foreground hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground data-[state=open]:bg-secondary">
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
                  <span className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed select-none">
                    {t("pricing")}
                  </span>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <span className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed select-none">
                    {t("about")}
                  </span>
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
              className="text-foreground hover:bg-secondary hover:text-foreground"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              <span className="block px-3 py-2 text-base font-medium text-muted-foreground rounded-md cursor-not-allowed select-none">Products</span>
              <div className="px-3 py-2">
                <div className="text-base font-medium text-foreground mb-2">{t("solutions")}</div>
                <Link
                  href="/solutions"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-ng-teal dark:text-ng-yellow hover:bg-secondary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("solutions_overview")}
                </Link>
                <div className="mt-1 max-h-[50vh] overflow-y-auto space-y-0.5 border-l border-border ml-2 pl-2">
                  {SOLUTION_SECTIONS.map(({ id, headerPrefix }) => (
                    <Link
                      key={id}
                      href={`/solutions#${id}`}
                      className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t(`${headerPrefix}_title`)}
                    </Link>
                  ))}
                </div>
              </div>
              <span className="block px-3 py-2 text-base font-medium text-muted-foreground rounded-md cursor-not-allowed select-none">Pricing</span>
              <span className="block px-3 py-2 text-base font-medium text-muted-foreground rounded-md cursor-not-allowed select-none">About</span>
              <div className="pt-4 pb-2 border-t border-border">
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