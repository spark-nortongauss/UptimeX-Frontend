"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminGuard from "@/components/AdminGuard"
import { Cpu, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import DeviceProfileStep from "./DeviceProfileStep"
import MibUploadStep from "./MibUploadStep"
import ApiIntegrationStep from "./ApiIntegrationStep"

export default function OEMDevicesPage() {
  const router = useRouter()

  /* ── Screen state & transition ── */
  const [screen, setScreen] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const transitionToScreen = useCallback((nextScreen) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setScreen(nextScreen)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      if (screen === 2) setScreen(1)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [screen])

  /* ── Step 1 form state (lifted here so it persists when switching steps) ── */
  const [oem, setOem] = useState("")
  const [equipmentModel, setEquipmentModel] = useState("")
  const [technology, setTechnology] = useState("")
  const [integrationType, setIntegrationType] = useState("")

  const [formErrors, setFormErrors] = useState({
    oem: false,
    equipmentModel: false,
    integrationType: false,
  })

  /* ── Navigation — no validation, free movement between steps ── */
  const handleNext = useCallback(() => {
    window.history.pushState({ step: 2 }, "")
    transitionToScreen(2)
  }, [transitionToScreen])

  const handleBack = useCallback(() => {
    transitionToScreen(1)
  }, [transitionToScreen])

  /* ── Render ── */
  return (
    <AdminGuard>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #2d4344, #3e6e70)",
              boxShadow: "0 4px 14px rgba(62, 110, 112, 0.3)",
            }}
          >
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">OEM Devices</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Register OEM device profiles and upload MIB files for SNMP integration
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div
          className="rounded-2xl border border-border bg-card overflow-visible"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
        >
          {/* Step indicator header bar */}
          <div
            className="px-8 py-5 border-b border-border rounded-t-2xl"
            style={{ background: "linear-gradient(135deg, #2d4344 0%, #3e6e70 100%)" }}
          >
            <div className="flex items-center justify-center gap-4">
              {/* Step 1 — clickable if on step 2 */}
              <button
                type="button"
                onClick={() => screen === 2 && transitionToScreen(1)}
                className="flex items-center gap-2 transition-opacity"
                style={{ cursor: screen === 2 ? "pointer" : "default", opacity: 1 }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={
                    screen === 1
                      ? { background: "#ffffff", color: "#2d4344", transform: "scale(1.1)" }
                      : { background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }
                  }
                >
                  1
                </div>
                <span
                  className="text-sm font-medium transition-colors hidden sm:inline"
                  style={{ color: screen === 1 ? "#ffffff" : "rgba(255,255,255,0.5)" }}
                >
                  Device Profile
                </span>
              </button>

              <ChevronRight className="h-5 w-5" style={{ color: "rgba(255,255,255,0.3)" }} />

              {/* Step 2 — clickable if on step 1 */}
              <button
                type="button"
                onClick={() => screen === 1 && transitionToScreen(2)}
                className="flex items-center gap-2 transition-opacity"
                style={{ cursor: screen === 1 ? "pointer" : "default", opacity: 1 }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={
                    screen === 2
                      ? { background: "#ffffff", color: "#2d4344", transform: "scale(1.1)" }
                      : { background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }
                  }
                >
                  2
                </div>
                <span
                  className="text-sm font-medium transition-colors hidden sm:inline"
                  style={{ color: screen === 2 ? "#ffffff" : "rgba(255,255,255,0.5)" }}
                >
                  {integrationType === "API" ? "API Integration" : "MIB Upload"}
                </span>
              </button>
            </div>
          </div>

          {/* Animated content area */}
          <div
            className={`transition-all duration-300 ease-out ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          >
            {screen === 1 && (
              <DeviceProfileStep
                oem={oem} setOem={setOem}
                equipmentModel={equipmentModel} setEquipmentModel={setEquipmentModel}
                technology={technology} setTechnology={setTechnology}
                integrationType={integrationType} setIntegrationType={setIntegrationType}
                formErrors={formErrors} setFormErrors={setFormErrors}
                onNext={handleNext}
              />
            )}

            {screen === 2 && integrationType === "API" && (
              <ApiIntegrationStep
                oem={oem}
                equipmentModel={equipmentModel}
                onBack={handleBack}
              />
            )}

            {screen === 2 && integrationType !== "API" && (
              <MibUploadStep
                oem={oem}
                equipmentModel={equipmentModel}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}