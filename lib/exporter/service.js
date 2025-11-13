import { exportData } from "./index"

export class ExportService {
  constructor({ rows = [], columns = [], fileBase = "export", title = "Export" } = {}) {
    this.rows = rows
    this.columns = columns
    this.fileBase = fileBase
    this.title = title
  }
  setRows(rows) { this.rows = rows }
  setColumns(columns) { this.columns = columns }
  setFileBase(fileBase) { this.fileBase = fileBase }
  setTitle(title) { this.title = title }
  async exportCSV() { await exportData({ rows: this.rows, columns: this.columns, formats: { csv: true }, fileBase: this.fileBase, title: this.title }) }
  async exportPDF() { await exportData({ rows: this.rows, columns: this.columns, formats: { pdf: true }, fileBase: this.fileBase, title: this.title }) }
  async export(formats) { await exportData({ rows: this.rows, columns: this.columns, formats, fileBase: this.fileBase, title: this.title }) }
}

