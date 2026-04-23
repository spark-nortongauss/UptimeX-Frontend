/* Shared UI components and constants for OEM Device flow */

import { useState, useRef, useEffect } from "react"
import { ChevronRight, X, CheckCircle2, ChevronDown } from "lucide-react"

/* ─── Constants ─── */

export const ACCEPTED_EXTENSIONS = [".mib", ".txt", ".my", ".smi", ".zip", ".tar.gz"]

export const TECHNOLOGY_OPTIONS = [
  "DAS", "ERRCS", "CBRS", "pLTE", "p5G", "WiFi", "FTTH", "Networking", "Switching", "Cloud", "IoT",
]

export const INTEGRATION_TYPE_OPTIONS = ["MIB", "API"]

/* ─── Style constants ─── */

export const inputBase =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-shadow"

export const inputRing = "focus:ring-[#3e6e70]/40 focus:border-[#3e6e70]"

/* ─── Label ─── */

export function Label({ children, htmlFor, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

/* ─── Animated Field Wrapper ─── */

export function AnimatedField({ children, delay = 0, className = "" }) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── Standard Single-Select Dropdown ─── */

export function SingleSelectDropdown({ id, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputBase} ${inputRing} text-left flex items-center justify-between`}
      >
        <span className={value ? "" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="absolute z-[60] mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-y-auto"
          style={{ maxHeight: 220 }}
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => { onChange(o); setOpen(false) }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors ${value === o ? "font-semibold" : ""}`}
              style={value === o ? { color: "#3e6e70", background: "rgba(62, 110, 112, 0.06)" } : {}}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Multi-Select Dropdown ─── */

export function MultiSelectDropdown({ id, selected, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const toggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputBase} ${inputRing} text-left flex items-center justify-between min-h-[42px]`}
      >
        <span className={selected.length > 0 ? "" : "text-muted-foreground"}>
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-md text-xs font-medium"
              style={{
                background: "rgba(62, 110, 112, 0.10)",
                color: "#3e6e70",
                border: "1px solid rgba(62, 110, 112, 0.18)",
              }}
            >
              {s}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(s) }}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div
          className="absolute z-[60] mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-y-auto"
          style={{ maxHeight: 220 }}
        >
          {options.map((o) => {
            const checked = selected.includes(o)
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggle(o)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2.5"
              >
                <span
                  className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                  style={
                    checked
                      ? { background: "#3e6e70", borderColor: "#3e6e70" }
                      : { borderColor: "rgba(128,128,128,0.3)" }
                  }
                >
                  {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                </span>
                {o}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── MIB file helpers ─── */

export function getFileExtension(filename) {
  if (filename.endsWith(".tar.gz")) return ".tar.gz"
  const dot = filename.lastIndexOf(".")
  return dot !== -1 ? filename.slice(dot).toLowerCase() : ""
}

export function isAcceptedFile(file) {
  const ext = getFileExtension(file.name)
  if (ACCEPTED_EXTENSIONS.includes(ext)) return true
  if ((ext === "" && file.type === "") || file.type === "application/octet-stream") return true
  return false
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
