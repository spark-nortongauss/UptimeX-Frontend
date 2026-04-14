"use client"

import { motion } from "framer-motion"
import { Radar, Brain, Zap, ShieldCheck, BarChart3, Bell, Layers, Clock, Database, Shield, Activity, Bot } from "lucide-react"

const capabilities = [
  {
    icon: Brain,
    title: "AI-Driven Root Cause",
    description: "Machine learning correlates signals across every layer — network, application, and infrastructure — to pinpoint root cause in seconds, not hours."
  },
  {
    icon: Zap,
    title: "Autonomous Remediation",
    description: "Zero-touch incident resolution executes guided runbooks automatically. Incidents self-heal before your end users ever notice a disruption."
  },
  {
    icon: Bell,
    title: "Predictive Alerting",
    description: "Anomaly detection baselines your system's normal behavior and fires intelligent pre-failure alerts — not noisy, meaningless threshold triggers."
  },
  {
    icon: ShieldCheck,
    title: "SLA Assurance Engine",
    description: "Customizable SLOs with error budget tracking ensure every contract commitment is met, with real-time visibility across your entire stack."
  },
  {
    icon: Layers,
    title: "Cross-Layer Correlation",
    description: "Every incident trace spans the full topology — from physical links to cloud services — delivering complete situational awareness instantly."
  },
  {
    icon: BarChart3,
    title: "Performance Baselines",
    description: "Continuous KPI benchmarking establishes intelligent baselines, enabling trend forecasting and capacity planning before you ever hit limits."
  },
  {
    icon: Clock,
    title: "24/7 NOC Coverage",
    description: "Outsourced Observability with a dedicated Service Manager, smart escalation paths, and monthly and quarterly operational review cycles."
  },
  {
    icon: Database,
    title: "Operational Intelligence",
    description: "Data-driven decisions backed by a collaborative knowledge base, audit-ready reporting, and continuously refined managed detection."
  }
]

const stats = [
  { number: "99.99%", label: "Availability Objective", icon: Shield },
  { number: "< 5m",   label: "Mean Time to Resolve",  icon: Activity },
  { number: "24/7",   label: "NOC Coverage",           icon: Radar },
  { number: "Zero-Touch", label: "Operations Target",  icon: Bot }
]

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4 border border-border">
            <Radar className="w-4 h-4 mr-2" />
            Observability & Monitoring
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Unified visibility for
            <span className="text-ng-teal dark:text-ng-yellow"> modern operations</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built for infrastructure health, incident prediction, and cognitive automation across distributed environments.
          </p>
        </motion.div>

        {/* ── Platform Capabilities ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3
            className="font-heading text-3xl font-bold text-center mb-3 text-foreground"
          >
            Platform Capabilities
          </h3>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Eight core pillars of intelligent, autonomous observability — built for modern operations teams.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group text-center p-6 rounded-2xl transition-all duration-300 border border-border bg-card"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#2D4344"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = ""
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#2D4344" }}
                >
                  <cap.icon style={{ width: 24, height: 24, color: "#D9FF35" }} />
                </div>
                <h4 className="font-heading text-base font-bold mb-3 text-card-foreground">
                  {cap.title}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {cap.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Stats Section (unchanged) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#0D1B1C] to-[#1A2C2D] rounded-3xl p-6 sm:p-8 md:p-12 text-center"
        >
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Operations confidence at every layer
          </h3>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
            From anomaly detection to autonomous remediation, teams maintain resilience with a single operational intelligence plane.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-ng-yellow rounded-full mb-4">
                  <stat.icon className="w-6 h-6 text-black" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-200 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}