"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Star, Radar, Shield, Crown, ChevronDown, ChevronUp } from "lucide-react"

// Pricing tiers per plan
const pricingTiers = [
  { range: "1 – 100", paas: "30 / equipment", outsourced: "50 / equipment" },
  { range: "100 – 500", paas: "27 / equipment", outsourced: "45 / equipment" },
  { range: "> 500", paas: "25 / equipment", outsourced: "41 / equipment" },
]

const allPlanFeatures = [
  { item: "24/7 ObservOne", description: "24/7 observability team to ensure your digital and connectivity assets are always available meeting SLAs" },
  { item: "24/7 Service Manager Access", description: "Single point of contact responsible for your account" },
  { item: "Traces to All Equipments", description: "Traces to all the metrics of your systems" },
  { item: "Customer Custom Access", description: "Customers can visualize their network" },
  { item: "Customizable SLAs", description: "Customized SLAs" },
  { item: "Customizable Escalation", description: "Customized escalation per customer or contract" },
  { item: "AI Step-by-Step Incident Resolution", description: "Step-by-step guide composed of 5 steps" },
  { item: "Autonomous Incident Resolution with AI", description: "Incidents resolved automatically without human interaction" },
  { item: "Cross-layer Incident Correlation", description: "Correlation across layers to identify root cause" },
  { item: "Knowledge Base", description: "Collaborative knowledge base" },
]

const outsourcedOnlyFeatures = [
  { item: "Monthly Service Review & Reporting", description: "Monthly meeting and report" },
  { item: "Quarterly Observability Report", description: "Quarterly performance report" },
  { item: "Event Day", description: "Dedicated monitoring during events" },
]

const plans = [
  {
    id: "paas",
    name: "PaaS",
    tagline: "Platform as a Service",
    description: "Self-managed observability platform with full AI-powered tooling and telemetry access.",
    icon: Radar,
    accentColor: "#1F6B6C",
    badgeColor: "bg-[#2D4344]",
    popular: false,
    deploymentFee: "Contact Us",
    integrationFee: "250 / equipment model / OEM",
    features: allPlanFeatures,
    extraFeatures: [],
  },
  {
    id: "outsourced",
    name: "Outsourced Observability",
    tagline: "Fully Managed Monitoring",
    description: "End-to-end managed observability with dedicated reporting, event coverage, and NOC governance.",
    icon: Shield,
    accentColor: "#4A7C00",
    badgeColor: "bg-[#D9FF35]",
    popular: true,
    deploymentFee: "Contact Us",
    integrationFee: "250 / equipment model / OEM",
    features: allPlanFeatures,
    extraFeatures: outsourcedOnlyFeatures,
  },
  {
    id: "dedicated",
    name: "Dedicated Team",
    tagline: "Enterprise War Room",
    description: "Fully embedded operations team with custom SLAs, tailored to your enterprise NOC model.",
    icon: Crown,
    accentColor: "#2A5F60",
    badgeColor: "bg-[#1A2C2D]",
    popular: false,
    deploymentFee: "Contact Us",
    integrationFee: "Contact Us",
    features: allPlanFeatures,
    extraFeatures: [],
    customNote: "All pricing on request — tailored to your infrastructure scale.",
  },
]

function FeatureRow({ feature, delay = 0 }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      viewport={{ once: true }}
      className="group"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 text-left py-1 focus:outline-none"
      >
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center mt-0.5">
          <Check className="w-3 h-3 text-primary" />
        </span>
        <span className="flex-1 text-muted-foreground text-sm leading-snug group-hover:text-card-foreground transition-colors">
          {feature.item}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-8 text-xs text-muted-foreground/70 pb-1"
          >
            {feature.description}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

export default function PricingSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-background to-secondary/60 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-secondary-foreground border border-border text-sm font-medium mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Plans & Packages
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Monitoring built for
            <span className="text-ng-teal dark:text-ng-yellow"> every scale</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From self-managed platforms to fully outsourced NOC operations — transparent per-equipment pricing
            that scales with your infrastructure.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? "md:-mt-6" : ""}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-ng-yellow text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 h-full relative overflow-hidden
                  ${plan.popular ? "border-ng-yellow" : "border-border"}`}
              >
                {/* Decorative blob */}
                <div
                  className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 blur-2xl pointer-events-none"
                  style={{ background: plan.accentColor }}
                />

                {/* Plan Icon + Name */}
                <div className="relative z-10 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: plan.accentColor + "22", border: `1.5px solid ${plan.accentColor}44` }}
                  >
                    <plan.icon className="w-6 h-6" style={{ color: plan.accentColor }} />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-widest mt-0.5 mb-3 text-muted-foreground">
                    {plan.tagline}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Pricing Tiers */}
                <div className="relative z-10 mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Live Equipments → Price
                  </p>

                  {plan.id !== "dedicated" ? (
                    <div className="space-y-2">
                      {pricingTiers.map((tier) => (
                        <div key={tier.range} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-mono text-xs bg-secondary px-2 py-0.5 rounded-md">
                            {tier.range}
                          </span>
                          <span className="font-semibold text-card-foreground text-xs">
                            {plan.id === "paas" ? tier.paas : tier.outsourced}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      {plan.customNote}
                    </div>
                  )}

                  {/* Fees */}
                  <div className="mt-4 space-y-1.5 border border-border rounded-xl p-3 bg-secondary/30">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Deployment & Config Fee</span>
                      <span className="text-card-foreground font-medium">{plan.deploymentFee}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">New System / Service Integration</span>
                      <span className="text-card-foreground font-medium text-right max-w-[50%]">{plan.integrationFee}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Core Features */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Included in all plans
                  </p>
                  <ul className="space-y-1.5">
                    {plan.features.map((f, fi) => (
                      <FeatureRow key={fi} feature={f} delay={index * 0.05 + fi * 0.03} />
                    ))}
                  </ul>
                </div>

                {/* Outsourced-Only Features */}
                {plan.extraFeatures.length > 0 && (
                  <>
                    <div className="border-t border-border my-6" />
                    <div className="relative z-10">
                      <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-foreground">
                        Outsourced Observability extras
                      </p>
                      <ul className="space-y-1.5">
                        {plan.extraFeatures.map((f, fi) => (
                          <FeatureRow key={fi} feature={f} delay={fi * 0.05} />
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border max-w-4xl mx-auto">
            <h3 className="font-heading text-2xl font-bold text-card-foreground mb-3">
              Need a managed operations setup?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Deploy outsourced observability, managed detection workflows, dedicated war room governance,
              and service health dashboards tailored to your NOC model. All plans include a dedicated
              Service Manager and 24/7 ObservOne coverage.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="px-6 py-3 rounded-xl bg-ng-yellow text-black font-semibold text-sm hover:opacity-90 transition-opacity">
                Contact Sales
              </button>
              <button className="px-6 py-3 rounded-xl border border-border text-card-foreground font-semibold text-sm hover:bg-secondary transition-colors">
                View Full Feature Matrix
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}