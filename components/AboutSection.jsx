"use client"

import { motion } from "framer-motion"
import { Brain, Zap, ShieldCheck, BarChart3, Bell, Layers, Clock, Database } from "lucide-react"

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

const keywords = [
  "Incident Prediction Engine",
  "Proactive Fault Prevention",
  "Anomaly Detection",
  "Self-Healing Networks",
  "Zero-Touch Operations",
  "Cross-Layer Monitoring",
  "ML-Powered Detection",
  "Cognitive Automation",
  "Error Budget Tracking",
  "Outsourced Observability",
  "Managed Detection",
  "Real-Time Telemetry",
  "SLO-Driven Monitoring",
  "Guided Runbook Execution",
  "Agentic Resolution",
  "Context-Aware Triage",
  "Noise-Free Alerting",
  "24/7 NOC Coverage",
  "Trend Forecasting",
  "Data-Driven Decisions",
]

const nocFeatures = [
  "Single point-of-contact Service Manager",
  "Monthly & quarterly performance reports",
  "Event day dedicated monitoring",
  "Customizable escalation per contract",
  "Collaborative knowledge base & runbooks",
]

const metrics = [
  { label: "Avg. Root Cause Detection", value: "< 30s" },
  { label: "Platform Availability",     value: "99.99%" },
  { label: "MTTR Reduction",            value: "70%" },
  { label: "Events Correlated Daily",   value: "50M+" },
]

const metricBars = [
  { label: "Incident Prediction Accuracy", value: "94%",    pct: 94    },
  { label: "Autonomous Resolution Rate",   value: "81%",    pct: 81    },
  { label: "Noise Reduction vs. Legacy",   value: "89%",    pct: 89    },
  { label: "SLA Compliance Rate",          value: "99.99%", pct: 99.99 },
]

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "var(--background, #F5F5F5)" }}
    >
      {/* Subtle teal grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(45,67,68,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,67,68,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              backgroundColor: "#2D4344",
              color: "#D9FF35",
              fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
            }}
          >
            <BarChart3 style={{ width: 16, height: 16 }} />
            Performance &amp; Insights
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            style={{
              fontFamily: "var(--font-primary, 'Ancorli', serif)",
              color: "var(--foreground, #000000)",
              lineHeight: 1.15,
            }}
          >
            Observe Everything.{" "}
            <span style={{ color: "#2D4344" }}>
              Predict. Prevent. Resolve.
            </span>
          </h2>

          <p
            className="text-xl max-w-3xl mx-auto leading-relaxed"
            style={{
              color: "#808080",
              fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
            }}
          >
            ObservOne is not just a monitoring dashboard — it's an autonomous operations intelligence platform. Powered by AI and deep cross-layer telemetry, it detects anomalies before they escalate, resolves incidents without human interaction, and delivers the operational clarity your team needs to hit every SLA.
          </p>
        </motion.div>

        

        

        {/* ── Keyword Tiles ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3
            className="text-3xl font-bold text-center mb-3"
            style={{
              fontFamily: "var(--font-primary, 'Ancorli', serif)",
              color: "var(--foreground, #000000)",
            }}
          >
            Built for Modern Operations
          </h3>
          <p
            className="text-center mb-10 max-w-2xl mx-auto"
            style={{
              color: "#808080",
              fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
            }}
          >
            Every capability your NOC, SRE, and operations team actually needs — out of the box.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {keywords.map((kw, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                viewport={{ once: true }}
                className="px-4 py-2 rounded-full text-sm font-semibold cursor-default transition-all duration-200"
                style={{
                  backgroundColor: "#2D4344",
                  color: "#D9FF35",
                  border: "1px solid #4D6869",
                  fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#D9FF35"
                  e.currentTarget.style.color = "#000000"
                  e.currentTarget.style.borderColor = "#D9FF35"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "#2D4344"
                  e.currentTarget.style.color = "#D9FF35"
                  e.currentTarget.style.borderColor = "#4D6869"
                }}
              >
                {kw}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ── NOC / Outsourced Observability ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{
                  backgroundColor: "#D9FF35",
                  color: "#000000",
                  fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
                }}
              >
                <Clock style={{ width: 16, height: 16 }} />
                Outsourced Observability
              </div>

              <h3
                className="text-2xl sm:text-3xl font-bold mb-6"
                style={{
                  fontFamily: "var(--font-primary, 'Ancorli', serif)",
                  color: "var(--foreground, #000000)",
                }}
              >
                Your 24/7 NOC, Without the Overhead
              </h3>

              <div
                className="space-y-4 leading-relaxed mb-8"
                style={{
                  color: "#808080",
                  fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
                }}
              >
                <p>
                  Managed Detection and Response as a fully outsourced service. A dedicated Service Manager handles your account end-to-end — from day-to-day alert triage and noise-free escalation paths to quarterly observability reports and event-day dedicated coverage.
                </p>
                <p>
                  Backed by AI-driven incident prediction, cross-layer correlation, and a collaborative knowledge base, our NOC team resolves issues autonomously — with full audit-ready reporting for every SLA cycle.
                </p>
              </div>

              <ul className="space-y-3">
                {nocFeatures.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3"
                    style={{
                      color: "#000000",
                      fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
                      fontSize: 15,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#D9FF35" }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#2D4344",
                        }}
                      />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — metric bars card */}
            <div
              className="rounded-3xl p-6 sm:p-8"
              style={{
                backgroundColor: "#2D4344",
                border: "1px solid #4D6869",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-8"
                style={{
                  color: "#D9FF35",
                  fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
                }}
              >
                What drives the difference
              </p>

              <div className="space-y-7">
                {metricBars.map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span
                        className="text-sm"
                        style={{
                          color: "#E6E6E6",
                          fontFamily: "var(--font-secondary, 'Techno Nue', sans-serif)",
                        }}
                      >
                        {m.label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: "#D9FF35",
                          fontFamily: "var(--font-primary, 'Ancorli', serif)",
                        }}
                      >
                        {m.value}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#4D6869" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.pct}%` }}
                        transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
                        viewport={{ once: true }}
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          backgroundColor: "#D9FF35",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}