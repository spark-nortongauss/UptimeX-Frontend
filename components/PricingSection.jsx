"use client"

import { motion } from "framer-motion"
import { Check, Star, Radar, Shield, Crown } from "lucide-react"

const plans = [
  {
    name: "Observability Core",
    description: "Cross-layer monitoring for full-stack visibility and telemetry clarity.",
    price: "Foundation",
    period: "stack",
    icon: Radar,
    color: "from-[#2D4344] to-[#4D6869]",
    popular: false,
    features: [
      "Full-Stack Observability",
      "Real-Time Telemetry",
      "End-to-End Visibility",
      "Network Intelligence",
      "Unified Operations View",
      "Infrastructure Health"
    ],
    limitations: [
      "Limited to 5 monitors",
      "Basic reporting only"
    ]
  },
  {
    name: "AI & Automation",
    description: "Cognitive automation workflows that reduce manual incident handling.",
    price: "Advanced",
    period: "automation",
    icon: Shield,
    color: "from-[#243B3C] to-[#D9FF35]",
    popular: true,
    features: [
      "Agentic Incident Resolution",
      "Autonomous Remediation",
      "AI-Driven Root Cause",
      "Self-Healing Networks",
      "Predictive Intelligence",
      "Zero-Touch Operations",
      "Cognitive Automation",
      "ML-Powered Detection"
    ],
    limitations: []
  },
  {
    name: "Reliability Command",
    description: "Incident and SLA assurance designed for always-on operations teams.",
    price: "Enterprise",
    period: "resilience",
    icon: Crown,
    color: "from-[#1A2C2D] to-[#2D4344]",
    popular: false,
    features: [
      "Incident Prediction Engine",
      "Proactive Fault Prevention",
      "Smart Escalation Paths",
      "Context-Aware Triage",
      "Event Correlation Engine",
      "SLA Assurance and Error Budget Tracking",
      "99.99% Availability Monitoring",
      "Dedicated War Room and 24/7 NOC Coverage"
    ],
    limitations: []
  }
]

export default function PricingSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-background to-secondary/60">
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
            Incident Management & Reliability
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Operational pillars for
            <span className="text-ng-teal dark:text-ng-yellow"> resilient services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Align teams around observability, autonomous remediation, and SLA-driven monitoring with a unified incident command model.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'md:-mt-8 md:mb-8' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-ng-yellow text-black px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${plan.popular ? 'border-ng-yellow scale-105' : 'border-border'} h-full relative overflow-hidden`}>
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${plan.color} opacity-10 rounded-full transform translate-x-16 -translate-y-16`}></div>
                
                {/* Plan Header */}
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-card-foreground">{plan.price}</span>
                      {plan.price !== "Foundation" && <span className="text-muted-foreground ml-2">/{plan.period}</span>}
                    </div>
                    {plan.price === "Foundation" && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-card-foreground mb-3">What is included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: (index * 0.1) + (featureIndex * 0.05) }}
                          viewport={{ once: true }}
                          className="flex items-start space-x-3"
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
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
          className="text-center mt-16"
        >
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border max-w-4xl mx-auto">
            <h3 className="font-heading text-2xl font-bold text-card-foreground mb-4">
              Managed operations requirement?
            </h3>
            <p className="text-muted-foreground mb-6">
              Deploy outsourced observability, managed detection workflows, dedicated war room governance, and service health dashboards tailored to your NOC model.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
