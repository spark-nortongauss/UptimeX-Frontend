"use client"

import { useState, useRef, useCallback } from "react"
import AuthGuard from "@/components/AuthGuard"
import { Cpu, Upload, FileText, X, CheckCircle2, AlertCircle, FileUp } from "lucide-react"

const ACCEPTED_EXTENSIONS = [".mib", ".txt", ".my", ".smi", ".zip", ".tar.gz"]
const ACCEPTED_MIME_TYPES = [
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/gzip",
  "application/x-gzip",
  "application/x-tar",
  "application/octet-stream",
]

function getFileExtension(filename) {
  if (filename.endsWith(".tar.gz")) return ".tar.gz"
  const dot = filename.lastIndexOf(".")
  return dot !== -1 ? filename.slice(dot).toLowerCase() : ""
}

function isAcceptedFile(file) {
  const ext = getFileExtension(file.name)
  // Accept files with valid extensions, or files with no extension (common for MIBs on Linux)
  if (ACCEPTED_EXTENSIONS.includes(ext)) return true
  if (ext === "" && file.type === "" || file.type === "application/octet-stream") return true
  return false
}

export default function OEMDevicesPage() {
  const [files, setFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  const handleFiles = useCallback((incoming) => {
    setError("")
    const newFiles = []
    const rejected = []

    Array.from(incoming).forEach((file) => {
      if (isAcceptedFile(file)) {
        // Prevent duplicates
        newFiles.push({
          file,
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
        })
      } else {
        rejected.push(file.name)
      }
    })

    if (rejected.length > 0) {
      setError(
        `Unsupported file${rejected.length > 1 ? "s" : ""}: ${rejected.join(", ")}. Accepted formats: .mib, .txt, .my, .smi, .zip, .tar.gz, or extensionless MIB files.`
      )
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      dragCounter.current = 0
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      e.target.value = ""
    }
  }

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setError("")
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <AuthGuard>
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              OEM Devices
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload MIB files to integrate and manage OEM device definitions
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <div
          className="rounded-2xl border border-border bg-card overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
        >
          {/* Card Header */}
          <div
            className="px-6 py-5 border-b border-border"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,67,68,0.06) 0%, rgba(62,110,112,0.04) 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <FileUp className="w-5 h-5" style={{ color: "#3e6e70" }} />
              <div>
                <h2 className="text-lg font-semibold text-foreground">MIB File Upload</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Upload your Management Information Base (MIB) files to add OEM device support
                </p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">

            {/* Dropzone */}
            < div
              id="mib-dropzone"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className="relative cursor-pointer rounded-xl transition-all duration-300"
              style={{
                border: isDragOver
                  ? "2px dashed #3e6e70"
                  : "2px dashed rgba(128,128,128,0.25)",
                background: isDragOver
                  ? "rgba(62, 110, 112, 0.08)"
                  : "rgba(128, 128, 128, 0.02)",
                padding: "3rem 2rem",
              }}
            >
              {/* Hidden input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mib,.txt,.my,.smi,.zip,.tar.gz"
                onChange={handleInputChange}
                className="hidden"
                id="mib-file-input"
              />

              <div className="text-center space-y-4">
                {/* Icon */}
                <div
                  className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl transition-transform duration-300"
                  style={{
                    background: isDragOver
                      ? "linear-gradient(135deg, #2d4344, #3e6e70)"
                      : "linear-gradient(135deg, rgba(45,67,68,0.1), rgba(62,110,112,0.08))",
                    transform: isDragOver ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <Upload
                    className="w-7 h-7 transition-colors duration-300"
                    style={{
                      color: isDragOver ? "#ffffff" : "#3e6e70",
                    }}
                  />
                </div>

                {/* Text */}
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {isDragOver
                      ? "Drop your MIB file here"
                      : "Drag & drop your MIB file here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    or{" "}
                    <span
                      className="font-medium underline underline-offset-2 transition-colors hover:text-foreground"
                      style={{ color: "#3e6e70" }}
                    >
                      browse your files
                    </span>{" "}
                    to select
                  </p>
                </div>

                {/* Accepted formats */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {[".mib", ".txt", ".my", ".smi", ".zip", ".tar.gz"].map((ext) => (
                    <span
                      key={ext}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-medium"
                      style={{
                        background: "rgba(62, 110, 112, 0.08)",
                        color: "#3e6e70",
                        border: "1px solid rgba(62, 110, 112, 0.12)",
                      }}
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}
              >
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Selected Files ({files.length})
                  </h3>
                  <button
                    onClick={() => {
                      setFiles([])
                      setError("")
                    }}
                    className="text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-2">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 border border-border bg-background group transition-all duration-200 hover:border-opacity-80"
                      style={{
                        borderLeft: "3px solid #3e6e70",
                      }}
                    >
                      <div
                        className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                        style={{ background: "rgba(62, 110, 112, 0.08)" }}
                      >
                        <FileText className="w-4 h-4" style={{ color: "#3e6e70" }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {f.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(f.size)} •{" "}
                          {getFileExtension(f.name) || "No extension"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0"
                          style={{ color: "#3e6e70" }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(f.id)
                          }}
                          className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard >
  )
}
