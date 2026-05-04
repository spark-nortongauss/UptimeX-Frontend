"use client"

import { useState, useCallback } from "react"
import {
  AnimatedField,
  Label,
  inputBase,
  inputRing,
  SingleSelectDropdown,
} from "./shared"
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  X,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

/* ─── Constants ─── */

const HTTP_METHODS = ["GET", "POST", "PUT"]
const POLLING_UNITS = ["Seconds", "Minutes", "Hours"]
const AUTH_TYPES = ["None", "API Key", "Bearer Token", "Basic Auth", "OAuth 2.0"]
const RESPONSE_FORMATS = ["JSON", "XML", "Plain Text"]

/* ─── Tiny helpers ─── */

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/* ─── Masked Input (with eye toggle) ─── */

function MaskedInput({ id, value, onChange, placeholder, label }) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputBase} ${inputRing} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

/* ─── Pill Toggle Group ─── */

function PillToggle({ options, value, onChange, wrap = false }) {
  return (
    <div className={`flex gap-2 ${wrap ? "flex-wrap" : ""}`}>
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-200"
            style={
              active
                ? {
                    background: "linear-gradient(135deg, #2d4344, #3e6e70)",
                    borderColor: "#3e6e70",
                    color: "#ffffff",
                    boxShadow: "0 2px 8px rgba(62, 110, 112, 0.25)",
                  }
                : {
                    background: "transparent",
                    borderColor: "rgba(128,128,128,0.25)",
                    color: "var(--muted-foreground)",
                  }
            }
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Key-Value Pair List ─── */

function KeyValueList({ label, items, setItems, keyPlaceholder = "Key", valuePlaceholder = "Value" }) {
  const addRow = () => setItems((prev) => [...prev, { id: uid(), key: "", value: "" }])
  const removeRow = (id) => setItems((prev) => prev.filter((r) => r.id !== id))
  const updateRow = (id, field, val) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: "rgba(62, 110, 112, 0.08)",
            color: "#3e6e70",
            border: "1px solid rgba(62, 110, 112, 0.18)",
          }}
        >
          <Plus className="w-3 h-3" />
          Add {label.split(" ").pop()}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No {label.toLowerCase()} configured.</p>
      )}

      <div className="space-y-2">
        {items.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <input
              type="text"
              value={row.key}
              onChange={(e) => updateRow(row.id, "key", e.target.value)}
              placeholder={keyPlaceholder}
              className={`flex-1 ${inputBase} ${inputRing}`}
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => updateRow(row.id, "value", e.target.value)}
              placeholder={valuePlaceholder}
              className={`flex-1 ${inputBase} ${inputRing}`}
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className="p-2 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */

export default function ApiIntegrationStep({ oem, equipmentModel, onBack }) {
  /* ── Endpoint ── */
  const [baseUrl, setBaseUrl] = useState("")
  const [httpMethod, setHttpMethod] = useState("GET")
  const [pollingValue, setPollingValue] = useState(30)
  const [pollingUnit, setPollingUnit] = useState("Seconds")

  /* ── Auth ── */
  const [authType, setAuthType] = useState("None")
  const [authFields, setAuthFields] = useState({
    apiKeyHeader: "",
    apiKeyValue: "",
    bearerToken: "",
    basicUser: "",
    basicPass: "",
    oauthClientId: "",
    oauthClientSecret: "",
    oauthTokenUrl: "",
    oauthScope: "",
  })

  const updateAuth = (field, value) =>
    setAuthFields((prev) => ({ ...prev, [field]: value }))

  /* ── Advanced ── */
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [headers, setHeaders] = useState([])
  const [queryParams, setQueryParams] = useState([])
  const [requestBody, setRequestBody] = useState("")

  /* ── Response ── */
  const [responseFormat, setResponseFormat] = useState("JSON")
  const [dataPath, setDataPath] = useState("")
  const [testState, setTestState] = useState("idle") // idle | loading | success | error
  const [testResult, setTestResult] = useState("")

  /* ── Test Connection ── */
  const runTest = useCallback(() => {
    setTestState("loading")
    setTestResult("")

    setTimeout(() => {
      if (!baseUrl.trim()) {
        setTestState("error")
        setTestResult(
          JSON.stringify(
            { error: "ECONNREFUSED", message: "Could not reach the endpoint. Verify the URL is correct and the server is reachable." },
            null,
            2
          )
        )
        return
      }
      // Mock success
      const willSucceed = Math.random() > 0.3
      if (willSucceed) {
        setTestState("success")
        setTestResult(
          JSON.stringify(
            {
              status: 200,
              data: {
                metrics: {
                  uptime: 99.97,
                  latency_ms: 12,
                  cpu_usage: 42.3,
                  memory_mb: 2048,
                  last_polled: "2026-04-23T18:14:00Z",
                },
                device: { id: "abc-123", model: equipmentModel || "Unknown", vendor: oem || "Unknown" },
              },
            },
            null,
            2
          )
        )
      } else {
        setTestState("error")
        setTestResult(
          JSON.stringify(
            { error: "HTTP 401", message: "Unauthorized — check your authentication settings." },
            null,
            2
          )
        )
      }
    }, 1500)
  }, [baseUrl, oem, equipmentModel])

  /* ── Provision ── */
  const handleProvision = useCallback(() => {
    if (!baseUrl.trim()) {
      toast.error("Base URL is required", {
        description: "Enter the API endpoint URL before provisioning.",
      })
      return
    }
    toast.success("Device profile provisioned successfully!", {
      description: `${oem} ${equipmentModel} — API integration via ${httpMethod} ${baseUrl}`,
    })
  }, [baseUrl, oem, equipmentModel, httpMethod])

  /* ────────────────── Render ────────────────── */

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* ═══ Section 1 — Endpoint Configuration ═══ */}
      <AnimatedField delay={0}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Endpoint Configuration
        </p>

        <div className="space-y-5">
          {/* Base URL */}
          <div>
            <Label htmlFor="api-base-url" required>Base URL</Label>
            <input
              id="api-base-url"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.manufacturer.com/v2/metrics"
              className={`${inputBase} ${inputRing}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* HTTP Method */}
            <div>
              <Label>HTTP Method</Label>
              <PillToggle options={HTTP_METHODS} value={httpMethod} onChange={setHttpMethod} />
            </div>

            {/* Polling Interval */}
            <div>
              <Label>Polling Interval</Label>
              <div className="flex">
                <input
                  type="number"
                  min={1}
                  value={pollingValue}
                  onChange={(e) => setPollingValue(Math.max(1, Number(e.target.value)))}
                  className={`${inputBase} ${inputRing} rounded-r-none border-r-0 w-24`}
                />
                <div className="relative flex-1">
                  <select
                    value={pollingUnit}
                    onChange={(e) => setPollingUnit(e.target.value)}
                    className={`${inputBase} ${inputRing} rounded-l-none appearance-none pr-8 h-full`}
                  >
                    {POLLING_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedField>

      <hr className="border-border opacity-60" />

      {/* ═══ Section 2 — Authentication ═══ */}
      <AnimatedField delay={50}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Authentication
        </p>

        <PillToggle options={AUTH_TYPES} value={authType} onChange={setAuthType} wrap />

        <div className="mt-5">
          {/* None */}
          {authType === "None" && (
            <p className="text-sm text-muted-foreground italic">
              No authentication will be sent with requests.
            </p>
          )}

          {/* API Key */}
          {authType === "API Key" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div>
                <Label htmlFor="api-key-header">Header Name</Label>
                <input
                  id="api-key-header"
                  type="text"
                  value={authFields.apiKeyHeader}
                  onChange={(e) => updateAuth("apiKeyHeader", e.target.value)}
                  placeholder="X-API-Key"
                  className={`${inputBase} ${inputRing}`}
                />
              </div>
              <MaskedInput
                id="api-key-value"
                value={authFields.apiKeyValue}
                onChange={(v) => updateAuth("apiKeyValue", v)}
                placeholder="Enter your API key"
                label="Key Value"
              />
            </div>
          )}

          {/* Bearer Token */}
          {authType === "Bearer Token" && (
            <div className="animate-in fade-in duration-300">
              <MaskedInput
                id="bearer-token"
                value={authFields.bearerToken}
                onChange={(v) => updateAuth("bearerToken", v)}
                placeholder="Enter your bearer token"
                label="Token"
              />
            </div>
          )}

          {/* Basic Auth */}
          {authType === "Basic Auth" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div>
                <Label htmlFor="basic-user">Username</Label>
                <input
                  id="basic-user"
                  type="text"
                  value={authFields.basicUser}
                  onChange={(e) => updateAuth("basicUser", e.target.value)}
                  placeholder="Username"
                  className={`${inputBase} ${inputRing}`}
                />
              </div>
              <MaskedInput
                id="basic-pass"
                value={authFields.basicPass}
                onChange={(v) => updateAuth("basicPass", v)}
                placeholder="Password"
                label="Password"
              />
            </div>
          )}

          {/* OAuth 2.0 */}
          {authType === "OAuth 2.0" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div>
                <Label htmlFor="oauth-client-id">Client ID</Label>
                <input
                  id="oauth-client-id"
                  type="text"
                  value={authFields.oauthClientId}
                  onChange={(e) => updateAuth("oauthClientId", e.target.value)}
                  placeholder="Client ID"
                  className={`${inputBase} ${inputRing}`}
                />
              </div>
              <MaskedInput
                id="oauth-client-secret"
                value={authFields.oauthClientSecret}
                onChange={(v) => updateAuth("oauthClientSecret", v)}
                placeholder="Client Secret"
                label="Client Secret"
              />
              <div>
                <Label htmlFor="oauth-token-url">Token URL</Label>
                <input
                  id="oauth-token-url"
                  type="text"
                  value={authFields.oauthTokenUrl}
                  onChange={(e) => updateAuth("oauthTokenUrl", e.target.value)}
                  placeholder="https://auth.example.com/oauth/token"
                  className={`${inputBase} ${inputRing}`}
                />
              </div>
              <div>
                <Label htmlFor="oauth-scope">Scope</Label>
                <input
                  id="oauth-scope"
                  type="text"
                  value={authFields.oauthScope}
                  onChange={(e) => updateAuth("oauthScope", e.target.value)}
                  placeholder="read write"
                  className={`${inputBase} ${inputRing}`}
                />
              </div>
            </div>
          )}
        </div>
      </AnimatedField>

      <hr className="border-border opacity-60" />

      {/* ═══ Section 3 — Advanced (collapsible) ═══ */}
      <AnimatedField delay={100}>
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="w-full flex items-center justify-between group"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Advanced Configuration
          </p>
          {advancedOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </button>

        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{
            maxHeight: advancedOpen ? "2000px" : "0px",
            opacity: advancedOpen ? 1 : 0,
            marginTop: advancedOpen ? "1.25rem" : "0",
          }}
        >
          <div className="space-y-6">
            {/* Custom Headers */}
            <KeyValueList
              label="Custom Headers"
              items={headers}
              setItems={setHeaders}
              keyPlaceholder="Header-Name"
              valuePlaceholder="Header value"
            />

            {/* Query Parameters */}
            <KeyValueList
              label="Query Parameters"
              items={queryParams}
              setItems={setQueryParams}
              keyPlaceholder="param"
              valuePlaceholder="value"
            />

            {/* Request Body — POST / PUT only */}
            {(httpMethod === "POST" || httpMethod === "PUT") && (
              <div className="animate-in fade-in duration-300">
                <Label htmlFor="request-body">Request Body (JSON)</Label>
                <textarea
                  id="request-body"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder={'{\n  "deviceId": "abc123"\n}'}
                  rows={8}
                  className={`${inputBase} ${inputRing} font-mono text-xs resize-y`}
                />
              </div>
            )}
          </div>
        </div>
      </AnimatedField>

      <hr className="border-border opacity-60" />

      {/* ═══ Section 4 — Response Mapping ═══ */}
      <AnimatedField delay={150}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Response Mapping
        </p>

        <div className="space-y-5">
          {/* Response Format */}
          <div className="md:w-1/2">
            <Label htmlFor="response-format">Response Format</Label>
            <SingleSelectDropdown
              id="response-format"
              value={responseFormat}
              onChange={setResponseFormat}
              options={RESPONSE_FORMATS}
              placeholder="Select format"
            />
          </div>

          {/* Data Path */}
          <div>
            <Label htmlFor="data-path">Data Path</Label>
            <input
              id="data-path"
              type="text"
              value={dataPath}
              onChange={(e) => setDataPath(e.target.value)}
              placeholder="e.g. data.metrics.uptime"
              className={`${inputBase} ${inputRing}`}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Dot-notation path to the metrics object inside the response.
            </p>
          </div>

          {/* Test Connection Panel */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              background: "rgba(128, 128, 128, 0.03)",
              border: "1px solid rgba(128, 128, 128, 0.12)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Test Connection</span>
              <button
                type="button"
                onClick={runTest}
                disabled={testState === "loading"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, #2d4344, #3e6e70)",
                  boxShadow: "0 2px 8px rgba(62, 110, 112, 0.25)",
                }}
              >
                {testState === "loading" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {testState === "loading" ? "Testing…" : "Run Test"}
              </button>
            </div>

            {/* Loading state */}
            {testState === "loading" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-300">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#3e6e70" }} />
                Sending request…
              </div>
            )}

            {/* Success state */}
            {testState === "success" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg"
                  style={{
                    borderLeft: "4px solid #22c55e",
                    background: "rgba(34, 197, 94, 0.06)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Connection successful
                  </span>
                </div>
                <pre
                  className="text-xs font-mono bg-background rounded-lg p-4 overflow-auto border border-border"
                  style={{ maxHeight: 160 }}
                >
                  {testResult}
                </pre>
              </div>
            )}

            {/* Error state */}
            {testState === "error" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg"
                  style={{
                    borderLeft: "4px solid #ef4444",
                    background: "rgba(239, 68, 68, 0.06)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Connection failed — check your URL and auth settings
                  </span>
                </div>
                <pre
                  className="text-xs font-mono bg-background rounded-lg p-4 overflow-auto border border-border"
                  style={{ maxHeight: 160 }}
                >
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </AnimatedField>

      {/* ═══ Bottom Actions ═══ */}
      <AnimatedField delay={200}>
        <div className="flex items-center justify-center gap-4 pt-4">
          {/* Back */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 hover:bg-accent/60 active:scale-[0.97]"
            style={{ borderColor: "rgba(128,128,128,0.25)", color: "var(--foreground)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Provision */}
          <button
            type="button"
            onClick={handleProvision}
            className="inline-flex items-center gap-2 px-10 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #2d4344, #3e6e70)",
              boxShadow: "0 4px 14px rgba(62, 110, 112, 0.3)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Provision
          </button>
        </div>
      </AnimatedField>
    </div>
  )
}
