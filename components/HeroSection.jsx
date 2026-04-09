"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Globe, Shield, Activity, MailWarning, Sparkles, Radar, Bot } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

const API_BASE =
  typeof process.env.NEXT_PUBLIC_API_URL === "string"
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : ""

export default function HeroSection() {
  const [trialEmail, setTrialEmail] = useState("")
  const [trialPhone, setTrialPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thankYouOpen, setThankYouOpen] = useState(false)
  const [invalidEmailOpen, setInvalidEmailOpen] = useState(false)
  const [invalidEmailMessage, setInvalidEmailMessage] = useState("")

  const apiMessage = (data) => {
    const m = data?.message
    if (typeof m === "string") return m
    if (Array.isArray(m)) return m.filter(Boolean).join(" ")
    return ""
  }

  const handleAccessTrial = async (e) => {
    e.preventDefault()
    if (!trialEmail.trim() || !trialPhone.trim()) return
    if (!API_BASE) {
      toast.error("Application API URL is not configured.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/trials/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trialEmail.trim(),
          phone: trialPhone.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 422) {
        setInvalidEmailMessage(
          apiMessage(data) ||
            "This email does not look valid or we could not deliver mail to it. Please check the address and try again.",
        )
        setInvalidEmailOpen(true)
        return
      }

      if (!res.ok) {
        const msg = apiMessage(data) || "Something went wrong. Please try again."
        throw new Error(msg || "Request failed.")
      }

      setTrialEmail("")
      setTrialPhone("")
      setThankYouOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const barHeights = [45, 70, 55, 85, 60, 90, 50, 75, 65, 95, 55, 80]
  const keywords = [
    "Full-Stack Observability",
    "Real-Time Telemetry",
    "Deep Trace Analytics",
    "Agentic Incident Resolution",
    "AI-Driven Root Cause",
    "SLO-Driven Monitoring",
  ]

  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden">
      {/* ── Thank You Dialog ── */}
      <Dialog open={thankYouOpen} onOpenChange={setThankYouOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-md border border-border shadow-2xl rounded-3xl overflow-hidden p-0 bg-card text-card-foreground [&>button]:text-white/80 [&>button]:hover:text-white [caret-color:transparent] outline-none focus:outline-none"
        >
          <DialogTitle className="sr-only">Trial request submitted</DialogTitle>
          <DialogDescription className="sr-only">
            Your trial account is being created. Check your email for next steps.
          </DialogDescription>

          <div className="relative bg-ng-teal px-7 pt-8 pb-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" strokeWidth={2} />
            </div>

            <h2 className="relative text-2xl font-extrabold text-white tracking-tight leading-snug">
              You&apos;re all set! 🎉
            </h2>
            <p className="relative mt-1 text-sm text-white/90 font-medium">
              Welcome to UptimeX
            </p>
          </div>

          <div className="px-7 py-6 space-y-4 bg-card">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Thanks for choosing UptimeX. Your{" "}
              <span className="font-semibold text-card-foreground">trial account</span> is being created
              right away. Please check your email for the next steps.
            </p>

            <div className="space-y-2.5">
              {[
                { icon: <Activity className="w-4 h-4 text-ng-teal" />, text: "Observability workspace is provisioning" },
                { icon: <Shield className="w-4 h-4 text-ng-teal" />, text: "Secure onboarding confirmation in progress" },
                { icon: <Globe className="w-4 h-4 text-ng-teal" />, text: "Unified operations view will be ready shortly" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 bg-muted rounded-xl px-4 py-2.5 border border-border"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Invalid Email Dialog ── */}
      <Dialog open={invalidEmailOpen} onOpenChange={setInvalidEmailOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-md border border-amber-200/80 shadow-2xl rounded-3xl overflow-hidden p-0 bg-white text-slate-900 dark:bg-white dark:text-slate-900 dark:border-amber-200/80 [&>button]:text-white/80 [&>button]:hover:text-white [caret-color:transparent] outline-none focus:outline-none"
        >
          <DialogTitle className="sr-only">Invalid email address</DialogTitle>
          <DialogDescription className="sr-only">
            The email address you entered does not appear to be valid.
          </DialogDescription>

          <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-7 pt-8 pb-8">
            <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 shadow-lg">
              <MailWarning className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h2 className="relative text-xl font-extrabold text-white tracking-tight">Email not valid</h2>
            <p className="relative mt-1 text-sm text-white/90">
              We could not use this email address for your trial request.
            </p>
          </div>
          <div className="px-7 py-6 space-y-4 bg-white">
            <p className="text-[15px] leading-relaxed text-slate-700">{invalidEmailMessage}</p>
            <p className="text-sm text-slate-500">
              Double-check spelling (for example <span className="font-medium text-slate-700">gmail.com</span>) and
              try again with an inbox you can open.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-ng-teal/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-ng-yellow/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ng-teal/10 rounded-full blur-3xl" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #2D4344 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* ── LEFT: Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-primary text-sm font-medium mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ng-yellow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ng-yellow"></span>
              </span>
              99.99% Availability — Zero Downtime Promise
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="font-heading text-5xl md:text-6xl xl:text-7xl font-extrabold text-foreground leading-[1.08] tracking-tight mb-6"
            >
              Full-Stack
              <br />
              <span className="text-ng-teal dark:text-ng-yellow">
                Observability
              </span>
              <br />
              <span className="text-3xl md:text-4xl xl:text-5xl font-bold text-foreground/70">
                with AI &amp; Automation
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl"
            >
              Real-time telemetry, network intelligence, incident prediction,
              and autonomous remediation — unified for resilient digital operations.
            </motion.p>

            {/* Keyword pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {keywords.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground border border-border"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* ── CTA FORM — single line pill ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="w-full max-w-xl mb-10"
            >
              <form onSubmit={handleAccessTrial} className="w-full">
                <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-card border border-border shadow-sm">
                  <input
                    type="email"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none focus:bg-muted transition-colors"
                  />
                  <div className="w-px h-5 bg-border shrink-0" />
                  <input
                    type="tel"
                    value={trialPhone}
                    onChange={(e) => setTrialPhone(e.target.value)}
                    placeholder="Phone number"
                    required
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none focus:bg-muted transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shrink-0 px-5 py-2.5 bg-ng-yellow hover:opacity-90 text-black text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md select-none whitespace-nowrap"
                  >
                    {isSubmitting ? "Submitting…" : "Access Trial"}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: <Radar className="w-4 h-4 text-ng-teal dark:text-ng-yellow" />, label: "Cross-Layer Monitoring" },
                { icon: <Bot className="w-4 h-4 text-ng-teal dark:text-ng-yellow" />, label: "Cognitive Automation" },
                { icon: <Sparkles className="w-4 h-4 text-ng-teal dark:text-ng-yellow" />, label: "Noise-Free Alerting" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  {icon}
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Dashboard ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-[#2D4344]/20 to-[#D9FF35]/20 blur-2xl -z-10" />

            {/* Main card */}
            <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">

              {/* Titlebar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Activity className="w-3.5 h-3.5" />
                  UptimeX Command View
                </div>
                <div className="w-16" />
              </div>

              <div className="p-5 space-y-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.015, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-secondary rounded-2xl p-4 border border-border"
                  >
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">SLA Assurance</p>
                    <p className="text-3xl font-black text-primary leading-none">99.99%</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                      <CheckCircle className="w-3 h-3" /> Healthy
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.015, 1] }}
                    transition={{ duration: 3, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-muted rounded-2xl p-4 border border-border"
                  >
                    <p className="text-xs font-semibold text-ng-teal dark:text-ng-yellow uppercase tracking-wide mb-1">MTTR</p>
                    <p className="text-3xl font-black text-ng-teal dark:text-ng-yellow leading-none">04m</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" /> Guided Runbook Execution
                    </div>
                  </motion.div>
                </div>

                {/* Chart */}
                <div className="bg-muted rounded-2xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">Event Correlation Engine · last 12 signals</span>
                    <span className="text-xs text-primary font-medium">Stable Signal-to-Noise</span>
                  </div>
                  <div className="flex items-end justify-between gap-1 h-20">
                    {barHeights.map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-[#2D4344] to-[#D9FF35]"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.6 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status row */}
                <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 border border-border">
                  <div className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ng-yellow opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ng-yellow"></span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Unified Operations View Active</p>
                    <p className="text-xs text-muted-foreground">Last checked 2 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}