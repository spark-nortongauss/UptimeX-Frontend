"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Users, Globe, Shield, ArrowRight, Activity, MailWarning } from "lucide-react"
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
        const msg =
          apiMessage(data) || "Something went wrong. Please try again."
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

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 overflow-hidden">
      <Dialog open={thankYouOpen} onOpenChange={setThankYouOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-md border border-slate-200 shadow-2xl rounded-3xl overflow-hidden p-0 bg-white text-slate-900 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>button]:text-white/80 [&>button]:hover:text-white [caret-color:transparent] outline-none focus:outline-none"
        >
          <DialogTitle className="sr-only">Trial request submitted</DialogTitle>
          <DialogDescription className="sr-only">
            Your trial account is being created. Check your email for next steps.
          </DialogDescription>

          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-7 pt-8 pb-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" strokeWidth={2} />
            </div>

            <h2 className="relative text-2xl font-extrabold text-white tracking-tight leading-snug">
              You&apos;re all set! 🎉
            </h2>
            <p className="relative mt-1 text-sm text-white/90 font-medium">
              Welcome to ObservOne
            </p>
          </div>

          <div className="px-7 py-6 space-y-4 bg-white">
            <p className="text-[15px] leading-relaxed text-slate-700">
              Thanks for choosing ObservOne. Your{" "}
              <span className="font-semibold text-slate-900">trial account</span> is being created
              right away. Please check your email for the next steps.
            </p>

            <div className="space-y-2.5">
              {[
                { icon: <Activity className="w-4 h-4 text-blue-500" />, text: "Account is being provisioned" },
                { icon: <Shield className="w-4 h-4 text-violet-500" />, text: "Confirmation email on its way" },
                { icon: <Globe className="w-4 h-4 text-emerald-500" />, text: "Full dashboard access in minutes" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-sm font-medium text-slate-800">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Background decoration — contained so it doesn't escape viewport */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #334155 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* ── LEFT: Copy ─────────────────────────────────────── */}
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              99.9% Uptime Guarantee
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6"
            >
              Monitor Your
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Digital World
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg"
            >
              Stay ahead of downtime with a smart monitoring platform built for
              real-time insights and instant alerts across your entire stack.
            </motion.p>

            {/* CTA form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="w-full max-w-xl mb-10"
            >
              <form onSubmit={handleAccessTrial}>
                <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                  <input
                    type="tel"
                    value={trialPhone}
                    onChange={(e) => setTrialPhone(e.target.value)}
                    placeholder="Phone number"
                    required
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shrink-0 px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-blue-500/30 select-none"
                  >
                    {isSubmitting ? "Submitting…" : "Access Trial →"}
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
                { icon: <Users className="w-4 h-4 text-blue-500" />, label: "10,000+ Users" },
                { icon: <Globe className="w-4 h-4 text-emerald-500" />, label: "Global Coverage" },
                { icon: <Shield className="w-4 h-4 text-violet-500" />, label: "Enterprise Security" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  {icon}
                  <span className="text-sm font-medium text-gray-600">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Dashboard ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl -z-10" />

            {/* Main card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden">

              {/* Titlebar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <Activity className="w-3.5 h-3.5" />
                  ObservOne Dashboard
                </div>
                <div className="w-16" /> {/* spacer */}
              </div>

              <div className="p-5 space-y-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.015, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100"
                  >
                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">Uptime</p>
                    <p className="text-3xl font-black text-emerald-700 leading-none">99.98%</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
                      <CheckCircle className="w-3 h-3" /> Healthy
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.015, 1] }}
                    transition={{ duration: 3, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-blue-50 rounded-2xl p-4 border border-blue-100"
                  >
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Response</p>
                    <p className="text-3xl font-black text-blue-700 leading-none">245ms</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-400">
                      <ArrowRight className="w-3 h-3" /> Avg. latency
                    </div>
                  </motion.div>
                </div>

                {/* Chart */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500">Response time · last 12 checks</span>
                    <span className="text-xs text-emerald-500 font-medium">▲ Stable</span>
                  </div>
                  <div className="flex items-end justify-between gap-1 h-20">
                    {barHeights.map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500 to-indigo-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.6 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status row */}
                <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                  <div className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">All Systems Operational</p>
                    <p className="text-xs text-gray-400">Last checked 2 minutes ago</p>
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