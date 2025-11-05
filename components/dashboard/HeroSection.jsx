import { useTranslations } from "next-intl"

export default function HeroSection() {
  const t = useTranslations("Overview.hero")
  return (
    <div className="flex items-center gap-4">
      <img src="/globe.svg" alt="logo" className="h-12 w-12" />
      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        {t("titlePrefix")} <span className="text-primary">{t("titleHighlight")}</span>
      </h1>
    </div>
  )
}
