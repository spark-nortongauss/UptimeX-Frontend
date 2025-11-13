"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Download, RefreshCw, AlertTriangle } from "lucide-react"
import { exportData } from "@/lib/exporter"

export default function ExportModule({
  data = [],
  columns = [],
  defaultFormats = { csv: true, pdf: true },
  fileBase = "export",
  title = "Export",
  buttonLabel = "Export",
  buttonClassName = "bg-[#5771d7] hover:bg-[#495fc0] text-white font-bold gap-2 border-0 shadow-sm",
  iconStrokeWidth = 3,
  onStart,
  onError,
  onComplete,
}) {
  const [open, setOpen] = useState(false)
  const [formats, setFormats] = useState(defaultFormats)
  const [selectedKeys, setSelectedKeys] = useState(columns.map((c) => c.key))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const effectiveColumns = useMemo(() => columns.filter((c) => selectedKeys.includes(c.key)), [columns, selectedKeys])
  const effectiveRows = useMemo(() => data.map((row) => {
    const mapped = {}
    for (const c of effectiveColumns) mapped[c.key] = row[c.key]
    return mapped
  }), [data, effectiveColumns])

  const toggleFormat = (key) => setFormats((prev) => ({ ...prev, [key]: !prev[key] }))
  const toggleColumn = (key) => {
    setSelectedKeys((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const handleExport = async () => {
    setError(null)
    if (!formats.csv && !formats.pdf) { setError("Select at least one format") ; return }
    setLoading(true)
    if (onStart) onStart({ formats, columns: effectiveColumns })
    try {
      await exportData({ rows: effectiveRows, columns: effectiveColumns, formats, fileBase, title })
      setOpen(false)
      if (onComplete) onComplete({ formats, columns: effectiveColumns })
    } catch (e) {
      setError("Failed to export files")
      if (onError) onError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        className={buttonClassName + " focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"}
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Open export options"
      >
        <Download className="h-4 w-4" strokeWidth={iconStrokeWidth} />
        {buttonLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-label="Export options" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <label htmlFor="format-pdf" className="flex-1 text-sm font-medium text-foreground">PDF</label>
              <input id="format-pdf" type="checkbox" aria-label="Select PDF" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={!!formats.pdf} onChange={() => toggleFormat("pdf")} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <label htmlFor="format-csv" className="flex-1 text-sm font-medium text-foreground">CSV</label>
              <input id="format-csv" type="checkbox" aria-label="Select CSV" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={!!formats.csv} onChange={() => toggleFormat("csv")} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Columns</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {columns.map((c) => (
                  <label key={c.key} className="flex items-center justify-between gap-3 text-sm">
                    <span>{c.header}</span>
                    <input type="checkbox" aria-label={`Select ${c.header}`} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedKeys.includes(c.key)} onChange={() => toggleColumn(c.key)} />
                  </label>
                ))}
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} aria-label="Cancel export">Cancel</Button>
            <Button onClick={handleExport} disabled={loading} aria-label="Confirm export" className="gap-2">
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              {loading ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export class ExportModuleClass {
  constructor(props) {
    this.props = props || {}
  }
  async export(formats) {
    const data = this.props.data || []
    const columns = this.props.columns || []
    const fileBase = this.props.fileBase || "export"
    const title = this.props.title || "Export"
    await exportData({ rows: data, columns, formats, fileBase, title })
  }
}

