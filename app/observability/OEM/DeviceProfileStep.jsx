"use client"

import {
  AnimatedField,
  Label,
  inputBase,
  inputRing,
  SingleSelectDropdown,
  TECHNOLOGY_OPTIONS,
  INTEGRATION_TYPE_OPTIONS,
} from "./shared"
import { ChevronRight } from "lucide-react"

export default function DeviceProfileStep({
  oem, setOem,
  equipmentModel, setEquipmentModel,
  technology, setTechnology,
  integrationType, setIntegrationType,
  formErrors, setFormErrors,
  onNext,
}) {
  return (
    /* min-h ensures the card is tall enough that the dropdown never
       overlaps the Next button, even when the full list is shown.      */
    <div className="p-6 lg:p-8 flex flex-col" style={{ minHeight: 520 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

        {/* Manufacturer (OEM) */}
        <AnimatedField delay={0}>
          <Label htmlFor="oem-input" required>Manufacturer (OEM)</Label>
          <input
            id="oem-input"
            type="text"
            value={oem}
            onChange={(e) => { setOem(e.target.value); setFormErrors((p) => ({ ...p, oem: false })) }}
            placeholder="e.g. Ericsson, Nokia, Huawei"
            className={`${inputBase} ${formErrors.oem ? "ring-2 ring-red-400/40 border-red-400" : inputRing}`}
          />
          {formErrors.oem && <p className="text-xs text-red-500 mt-1">Manufacturer is required</p>}
        </AnimatedField>

        {/* Equipment Model */}
        <AnimatedField delay={40}>
          <Label htmlFor="model-input" required>Equipment Model</Label>
          <input
            id="model-input"
            type="text"
            value={equipmentModel}
            onChange={(e) => { setEquipmentModel(e.target.value); setFormErrors((p) => ({ ...p, equipmentModel: false })) }}
            placeholder="e.g. MBDA-US-700ABC"
            className={`${inputBase} ${formErrors.equipmentModel ? "ring-2 ring-red-400/40 border-red-400" : inputRing}`}
          />
          {formErrors.equipmentModel && <p className="text-xs text-red-500 mt-1">Equipment Model is required</p>}
        </AnimatedField>

        {/* Technology (single select)
            — extra bottom padding reserves space so the dropdown list
              can open downward without being clipped by the card edge   */}
        <AnimatedField delay={80} className="pb-40">
          <Label htmlFor="tech-select">Technology</Label>
          <SingleSelectDropdown
            id="tech-select"
            value={technology}
            onChange={setTechnology}
            options={TECHNOLOGY_OPTIONS}
            placeholder="Select technology"
          />
        </AnimatedField>

        {/* API or MIB */}
        <AnimatedField delay={120}>
          <Label htmlFor="integration-type" required>API or MIB</Label>
          <div className="flex gap-3">
            {INTEGRATION_TYPE_OPTIONS.map((option) => {
              const selected = integrationType === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setIntegrationType(option); setFormErrors((p) => ({ ...p, integrationType: false })) }}
                  className="flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200"
                  style={
                    selected
                      ? {
                        background: "linear-gradient(135deg, #2d4344, #3e6e70)",
                        borderColor: "#3e6e70",
                        color: "#ffffff",
                        boxShadow: "0 2px 8px rgba(62, 110, 112, 0.25)",
                      }
                      : {
                        background: "transparent",
                        borderColor: formErrors.integrationType ? "rgb(248 113 113)" : "rgba(128,128,128,0.25)",
                        color: "var(--muted-foreground)",
                      }
                  }
                >
                  {option}
                </button>
              )
            })}
          </div>
          {formErrors.integrationType && (
            <p className="text-xs text-red-500 mt-1">Please select API or MIB</p>
          )}
          {integrationType && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {integrationType === "MIB"
                ? "You'll upload MIB files in the next step."
                : "You'll configure API integration details in the next step."}
            </p>
          )}
        </AnimatedField>

      </div>

      {/* Next Button — pushed to the bottom of the flex column so it
          always sits well below the dropdown's open state             */}
      <AnimatedField delay={200} className="mt-auto pt-10">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-10 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #2d4344, #3e6e70)",
              boxShadow: "0 4px 14px rgba(62, 110, 112, 0.3)",
            }}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </AnimatedField>
    </div>
  )
}