export const filenameSuffix = () => new Date().toISOString().replace(/[:.]/g, "-")

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const ensureJsPDF = async () => {
  if (typeof window !== "undefined" && window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF
  await new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
  return window.jspdf.jsPDF
}

export const buildCSV = ({ rows, columns }) => {
  const escape = (val) => {
    if (val == null) return ""
    const s = String(val)
    if (s.includes(",") || s.includes("\n") || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const headers = columns.map((c) => c.header)
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(columns.map((c) => escape(row[c.key])).join(","))
  }
  return lines.join("\n")
}

export const buildPDFBlob = async ({ rows, columns, title, includeTimestamp = true }) => {
  const JsPDF = await ensureJsPDF()
  const doc = new JsPDF({ unit: "pt", format: "a4" })
  const marginLeft = 40
  const marginTop = 50
  const lineHeight = 18
  const pageWidth = doc.internal.pageSize.getWidth()
  const usableWidth = pageWidth - marginLeft * 2
  doc.setFontSize(16)
  doc.text(title || "Export", marginLeft, marginTop)
  if (includeTimestamp) {
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, marginTop + 20)
  }
  let y = marginTop + 50
  doc.setFont(undefined, "bold")
  doc.setFontSize(12)
  let x = marginLeft
  const colWidths = columns.map((_, i) => (i === 0 ? usableWidth * 0.45 : usableWidth * 0.55))
  for (let i = 0; i < columns.length; i += 1) {
    doc.text(columns[i].header, x, y)
    x += colWidths[i]
  }
  doc.setFont(undefined, "normal")
  y += 8
  doc.setLineWidth(0.5)
  doc.line(marginLeft, y, marginLeft + usableWidth, y)
  y += 12
  for (const row of rows) {
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage()
      y = marginTop
    }
    doc.setFontSize(11)
    x = marginLeft
    for (let i = 0; i < columns.length; i += 1) {
      const val = row[columns[i].key]
      doc.text(String(val ?? ""), x, y)
      x += colWidths[i]
    }
    y += lineHeight
  }
  return doc.output("blob")
}

export const exportData = async ({ rows, columns, formats, fileBase = "export", title }) => {
  const tasks = []
  const ts = filenameSuffix()
  if (formats?.csv) {
    const csv = buildCSV({ rows, columns })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    tasks.push(Promise.resolve().then(() => downloadBlob(blob, `${fileBase}-${ts}.csv`)))
  }
  if (formats?.pdf) {
    tasks.push(
      buildPDFBlob({ rows, columns, title }).then((blob) => downloadBlob(blob, `${fileBase}-${ts}.pdf`))
    )
  }
  await Promise.all(tasks)
}

