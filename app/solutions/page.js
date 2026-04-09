"use client"

import { motion } from "framer-motion"
import Header from "@/components/Header"
import { SOLUTION_SECTIONS, PAGE_KEY_BY_ID } from "@/lib/solutionsCatalog"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Radar } from "lucide-react"

export default function SolutionsPage() {
  const t = useTranslations("SolutionsPage")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <section className="relative py-20 md:py-28 border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-background pointer-events-none" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6 border border-border"
            >
              <Radar className="w-4 h-4 mr-2" />
              {t("hero_kicker")}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            >
              {t("hero_title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              {t("hero_subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Button asChild className="bg-ng-yellow text-black hover:opacity-90 font-semibold shadow-lg">
                <Link href="/signin">
                  Access Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16 border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-4">{t("intro_title")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t("intro_body")}</p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20 md:space-y-24">
            {SOLUTION_SECTIONS.map(({ id, Icon }, index) => {
              const pk = PAGE_KEY_BY_ID[id]
              return (
                <motion.article
                  key={id}
                  id={id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: Math.min(index * 0.03, 0.2) }}
                  className="scroll-mt-24 grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start max-w-5xl mx-auto"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border text-ng-teal dark:text-ng-yellow">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {t(`${pk}_title`)}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{t(`${pk}_body`)}</p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section className="py-16 border-t border-border bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <p className="text-muted-foreground mb-6">{t("footer_prompt")}</p>
            <Button asChild variant="outline" className="mr-3">
              <Link href="/">{t("footer_back_home")}</Link>
            </Button>
            <Button asChild className="bg-ng-yellow text-black hover:opacity-90 font-semibold">
              <Link href="/signin">Access Platform</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
