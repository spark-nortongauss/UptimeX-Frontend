"use client"

import { useState, useRef, useCallback } from "react"
import {
  AnimatedField,
  isAcceptedFile,
  getFileExtension,
  formatSize,
} from "./shared"
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Files,
} from "lucide-react"
import { toast } from "sonner"

export default function MibUploadStep({ oem, equipmentModel, onBack }) {
  const [files, setFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  const handleFiles = useCallback((incoming) => {
    setUploadError("")
    const newFiles = []
    const rejected = []
    const duplicates = []

    Array.from(incoming).forEach((file) => {
      if (!isAcceptedFile(file)) {
        rejected.push(file.name)
        return
      }
      // Check for duplicates by name+size
      const isDupe = files.some((f) => f.name === file.name && f.size === file.size)
      if (isDupe) {
        duplicates.push(file.name)
        return
      }
      newFiles.push({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
      })
    })

    const errors = []
    if (rejected.length > 0)
      errors.push(`Unsupported file${rejected.length > 1 ? "s" : ""}: ${rejected.join(", ")}`)
    if (duplicates.length > 0)
      errors.push(`Already added: ${duplicates.join(", ")}`)
    if (errors.length > 0) setUploadError(errors.join(" · "))

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles])
      if (newFiles.length > 1)
        toast.success(`${newFiles.length} files added`, { description: newFiles.map((f) => f.name).join(", ") })
    }
  }, [files])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++
    setIsDragOver(true)
  }, [])
  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragOver(false)
  }, [])
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation() }, [])
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragOver(false); dragCounter.current = 0
    if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setUploadError("")
  }

  const handleBrowseMore = useCallback((e) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }, [])

  const handleProvision = useCallback(() => {
    if (files.length === 0) {
      toast.error("Please upload at least one MIB file.", {
        description: "Drag & drop or browse to select your MIB files.",
      })
      return
    }
    toast.success("Device profile provisioned successfully!", {
      description: `${oem} ${equipmentModel} — ${files.length} MIB file${files.length > 1 ? "s" : ""} attached.`,
    })
  }, [files, oem, equipmentModel])

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Info banner */}
      <AnimatedField delay={0}>
        <div
          className="rounded-xl px-5 py-4 flex items-start gap-3"
          style={{ background: "rgba(62, 110, 112, 0.06)", border: "1px solid rgba(62, 110, 112, 0.12)" }}
        >
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#3e6e70" }} />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground mb-1">Multiple MIB Files Supported</p>
            <p>
              Drop or browse <span className="font-semibold text-foreground">multiple files at once</span> — all will be attached together.
              Accepted formats:{" "}
              {[".mib", ".txt", ".my", ".smi", ".zip", ".tar.gz"].map((ext) => (
                <span key={ext} className="font-mono text-xs font-medium text-foreground">{ext} </span>
              ))}
              or extensionless MIB files.
            </p>
          </div>
        </div>
      </AnimatedField>

      {/* Dropzone */}
      <AnimatedField delay={100}>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer rounded-xl transition-all duration-300 select-none"
          style={{
            border: isDragOver ? "2px dashed #3e6e70" : "2px dashed rgba(128,128,128,0.25)",
            background: isDragOver ? "rgba(62, 110, 112, 0.08)" : "rgba(128, 128, 128, 0.02)",
            padding: files.length > 0 ? "2rem" : "3rem 2rem",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".mib,.txt,.my,.smi,.zip,.tar.gz"
            onChange={(e) => {
              if (e.target.files?.length > 0) {
                handleFiles(e.target.files)
                e.target.value = ""
              }
            }}
            className="hidden"
          />

          <div className="text-center space-y-3">
            {/* Icon */}
            <div
              className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300"
              style={{
                background: isDragOver
                  ? "linear-gradient(135deg, #2d4344, #3e6e70)"
                  : "linear-gradient(135deg, rgba(45,67,68,0.1), rgba(62,110,112,0.08))",
                transform: isDragOver ? "scale(1.12)" : "scale(1)",
              }}
            >
              {isDragOver
                ? <Files className="w-7 h-7 text-white" />
                : <Upload className="w-7 h-7" style={{ color: "#3e6e70" }} />
              }
            </div>

            {/* Text */}
            <div>
              <p className="text-base font-semibold text-foreground">
                {isDragOver
                  ? "Drop all your MIB files here"
                  : files.length > 0
                    ? "Drop more MIB files or browse to add"
                    : "Drag & drop your MIB files here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isDragOver ? (
                  <span style={{ color: "#3e6e70" }}>Release to upload multiple files at once</span>
                ) : (
                  <>
                    You can select or drop{" "}
                    <span className="font-semibold text-foreground">multiple files at once</span>
                    {" — "}or{" "}
                    <span
                      className="font-medium underline underline-offset-2"
                      style={{ color: "#3e6e70" }}
                    >
                      browse to select
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Extension badges */}
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
      </AnimatedField>

      {/* Error */}
      {uploadError && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)" }}
        >
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Selected files list */}
      {files.length > 0 && (
        <AnimatedField delay={0}>
          <div className="space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Attached Files
                </h3>
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                  style={{ background: "#3e6e70" }}
                >
                  {files.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {formatSize(totalSize)} total
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Add more button */}
                <button
                  type="button"
                  onClick={handleBrowseMore}
                  className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "rgba(62, 110, 112, 0.08)",
                    color: "#3e6e70",
                    border: "1px solid rgba(62, 110, 112, 0.18)",
                  }}
                >
                  <Plus className="w-3 h-3" />
                  Add more
                </button>
                <button
                  type="button"
                  onClick={() => { setFiles([]); setUploadError("") }}
                  className="text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* File rows */}
            <div className="space-y-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(128,128,128,0.12)" }}>
              {files.map((f, idx) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 px-4 py-3 bg-background group transition-colors hover:bg-accent/40"
                  style={{
                    borderBottom: idx < files.length - 1 ? "1px solid rgba(128,128,128,0.08)" : "none",
                    borderLeft: "3px solid #3e6e70",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                    style={{ background: "rgba(62, 110, 112, 0.08)" }}
                  >
                    <FileText className="w-4 h-4" style={{ color: "#3e6e70" }} />
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(f.size)}
                      {" · "}
                      <span className="font-mono">{getFileExtension(f.name) || "no ext"}</span>
                    </p>
                  </div>

                  {/* Status + remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#3e6e70" }} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Remove file"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedField>
      )}

      {/* Provision Button */}
      <AnimatedField delay={200}>
        <div className="flex justify-center pt-4">
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