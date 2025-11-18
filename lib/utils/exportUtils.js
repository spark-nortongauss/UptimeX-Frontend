import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { useMonitoringDataStore } from '@/lib/stores/monitoringDataStore'
import { useSystemSelectionStore } from '@/lib/stores/systemSelectionStore'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'

/**
 * Collects all data from all components on the detailed system page
 */
export function collectAllComponentData(systemId) {
  const systemStore = useSystemSelectionStore.getState()
  const monitoringStore = useMonitoringDataStore.getState()
  const timeframeStore = useTimeframeFilterStore.getState()
  const system = systemStore.systemsById[systemId]

  // System Information (from SystemTopbar)
  const systemInfo = {
    systemName: system?.name || systemId || 'Unknown',
    status: system?.status || 'Unknown',
    location: system?.location || 'N/A',
    oem: system?.inventory?.oem || system?.inventory?.manufacturer || system?.inventory?.hardware || system?.inventory?.model || 'N/A',
    systemType: system?.inventory?.type_full || system?.type || 'N/A',
    vendor: system?.inventory?.vendor || 'N/A',
    propertyType: system?.inventory?.property_type || system?.inventory?.type || 'N/A',
    targetSla: system?.targetSla || 'N/A',
    achievedSla: system?.achievedSla || 'N/A',
    createdAt: system?.createdAt || 'N/A',
  }

  // System Health Cards Data
  const availability = system?.achievedSla ? Number(String(system.achievedSla).replace('%', '')) : undefined
  const targetSlaValue = system?.targetSla ? Number(String(system.targetSla).replace('%', '')) : null
  const healthData = {
    overallStatus: 'UP',
    overallAvailability: availability !== undefined ? `${availability.toFixed(2)}%` : 'N/A',
    targetSla: targetSlaValue !== null ? `${targetSlaValue}%` : 'N/A',
  }

  // Temperature Chart Data
  let temperatureData = []
  if (monitoringStore.monitoringData && monitoringStore.currentHostId === systemId) {
    const chartData = monitoringStore.getTemperatureChartData()
    const aggregated = monitoringStore.getAggregatedTemperatureData()
    let data = aggregated.length > 0 ? aggregated : chartData

    // Filter by timeframe
    const { isInRange } = timeframeStore
    data = data.filter((point) => {
      if (point.timestamp) {
        return isInRange(point.timestamp)
      }
      if (point.time) {
        const [hours, minutes] = point.time.split(':').map(Number)
        if (!isNaN(hours) && !isNaN(minutes)) {
          const now = new Date()
          const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
          const timestamp = Math.floor(checkDate.getTime() / 1000)
          return isInRange(timestamp)
        }
      }
      return false
    })

    temperatureData = data.map((point) => ({
      time: point.time || 'N/A',
      timestamp: point.timestamp ? new Date(point.timestamp * 1000).toLocaleString() : 'N/A',
      BIU1: point.BIU1 !== null && point.BIU1 !== undefined ? `${point.BIU1.toFixed(1)}°C` : 'N/A',
      BIU2: point.BIU2 !== null && point.BIU2 !== undefined ? `${point.BIU2.toFixed(1)}°C` : 'N/A',
      BIU3: point.BIU3 !== null && point.BIU3 !== undefined ? `${point.BIU3.toFixed(1)}°C` : 'N/A',
    }))
  }

  // Network Connectivity Charts Data
  // Note: These are currently using mock data in the components
  // In a real scenario, you'd fetch this from the monitoring store
  const networkData = {
    icmp: [
      { time: '00:00', status: 1 },
      { time: '03:00', status: 1 },
      { time: '06:00', status: 1 },
      { time: '09:00', status: 1 },
      { time: '12:00', status: 1 },
      { time: '15:00', status: 1 },
      { time: '18:00', status: 1 },
      { time: '21:00', status: 1 },
    ],
    latency: [
      { time: '00:00', latency: 182 },
      { time: '03:00', latency: 180 },
      { time: '06:00', latency: 185 },
      { time: '09:00', latency: 170 },
      { time: '12:00', latency: 182 },
      { time: '15:00', latency: 181 },
      { time: '18:00', latency: 176 },
      { time: '21:00', latency: 185 },
    ],
    loss: [
      { time: '00:00', loss: 0 },
      { time: '03:00', loss: 0 },
      { time: '06:00', loss: 1 },
      { time: '09:00', loss: 0 },
      { time: '12:00', loss: 0 },
      { time: '15:00', loss: 0 },
      { time: '18:00', loss: 1 },
      { time: '21:00', loss: 0 },
    ],
  }

  // RF Metrics Data
  const rfData = {
    tx: [
      { time: '00:00', sector1: 34.6, sector2: 34.2, sector3: 33.2 },
      { time: '03:00', sector1: 34.9, sector2: 34.9, sector3: 33.6 },
      { time: '06:00', sector1: 34.7, sector2: 35.0, sector3: 33.8 },
      { time: '09:00', sector1: 34.5, sector2: 34.5, sector3: 33.3 },
      { time: '12:00', sector1: 35.1, sector2: 35.2, sector3: 33.9 },
      { time: '15:00', sector1: 34.8, sector2: 34.7, sector3: 34.1 },
      { time: '18:00', sector1: 34.9, sector2: 34.8, sector3: 33.7 },
      { time: '21:00', sector1: 35.2, sector2: 35.1, sector3: 33.4 },
    ],
    rx: [
      { time: '00:00', sector1: 46, sector2: 45.5, sector3: 46.2 },
      { time: '03:00', sector1: 45.5, sector2: 46.2, sector3: 45.7 },
      { time: '06:00', sector1: 46.2, sector2: 45.7, sector3: 46.8 },
      { time: '09:00', sector1: 45.7, sector2: 46.8, sector3: 46.1 },
      { time: '12:00', sector1: 46.8, sector2: 46.1, sector3: 45.9 },
      { time: '15:00', sector1: 46.1, sector2: 45.9, sector3: 46.4 },
      { time: '18:00', sector1: 45.9, sector2: 46.4, sector3: 46.0 },
      { time: '21:00', sector1: 46.4, sector2: 46.0, sector3: 45.8 },
    ],
    averages: [
      { sector: 1, avg: 34.9 },
      { sector: 2, avg: 35.0 },
      { sector: 3, avg: 33.4 },
    ],
  }

  // Optical Charts Data
  const opticalData = {
    pd: [
      { time: '00:00', sector1: 1.6, sector2: 3.1, sector3: 0 },
      { time: '03:00', sector1: 1.62, sector2: 3.1, sector3: 0 },
      { time: '06:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
      { time: '09:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
      { time: '12:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
      { time: '15:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
      { time: '18:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
      { time: '21:00', sector1: 1.7, sector2: 3.1, sector3: 0 },
    ],
    ld: [
      { time: '00:00', sector1: 6.65, sector2: 6.6, sector3: 6.6 },
      { time: '03:00', sector1: 6.66, sector2: 6.7, sector3: 6.7 },
      { time: '06:00', sector1: 6.67, sector2: 6.62, sector3: 6.65 },
      { time: '09:00', sector1: 6.7, sector2: 6.64, sector3: 6.68 },
      { time: '12:00', sector1: 6.72, sector2: 6.66, sector3: 6.63 },
      { time: '15:00', sector1: 6.69, sector2: 6.6, sector3: 6.61 },
      { time: '18:00', sector1: 6.68, sector2: 6.62, sector3: 6.6 },
      { time: '21:00', sector1: 6.8, sector2: 6.7, sector3: 6.75 },
    ],
  }

  // Timeframe information
  const timeframe = {
    dateFrom: timeframeStore.dateFrom,
    dateTo: timeframeStore.dateTo,
    timeFrom: timeframeStore.timeFrom,
    timeTo: timeframeStore.timeTo,
  }

  return {
    systemInfo,
    healthData,
    temperatureData,
    networkData,
    rfData,
    opticalData,
    timeframe,
    exportDate: new Date().toLocaleString(),
  }
}

/**
 * Generates a well-formatted PDF document with all component data
 */
export function generatePDF(systemId) {
  try {
    const data = collectAllComponentData(systemId)
    const doc = new jsPDF()
  
  let yPos = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin

  // Helper function to add a new page if needed
  const checkNewPage = (requiredHeight) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPos = 20
      return true
    }
    return false
  }

  // Title Page
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.text('System Monitoring Report', margin, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Generated: ${data.exportDate}`, margin, yPos)
  yPos += 15

  // System Information Section
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('1. System Information', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  
  const systemInfoRows = [
    ['System Name', data.systemInfo.systemName],
    ['Status', data.systemInfo.status],
    ['Location', data.systemInfo.location],
    ['OEM/Manufacturer', data.systemInfo.oem],
    ['System Type', data.systemInfo.systemType],
    ['Vendor', data.systemInfo.vendor],
    ['Property Type', data.systemInfo.propertyType],
    ['Target SLA', data.systemInfo.targetSla],
    ['Achieved SLA', data.systemInfo.achievedSla],
    ['Created At', data.systemInfo.createdAt],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [['Property', 'Value']],
    body: systemInfoRows,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 15

  // Timeframe Information
  checkNewPage(20)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Report Timeframe:', margin, yPos)
  yPos += 7
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`From: ${data.timeframe.dateFrom} ${data.timeframe.timeFrom}`, margin, yPos)
  yPos += 5
  doc.text(`To: ${data.timeframe.dateTo} ${data.timeframe.timeTo}`, margin, yPos)
  yPos += 15

  // System Health Section
  checkNewPage(30)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('2. System Health Status', margin, yPos)
  yPos += 10

  const healthRows = [
    ['Overall Status', data.healthData.overallStatus],
    ['Overall Availability', data.healthData.overallAvailability],
    ['Target SLA', data.healthData.targetSla],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: healthRows,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 15

  // Temperature Monitoring Section
  if (data.temperatureData.length > 0) {
    checkNewPage(40)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('3. Temperature Monitoring', margin, yPos)
    yPos += 5
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text('This section shows temperature readings from BIU (Base Interface Unit) sensors over time.', margin, yPos)
    yPos += 10

    const tempTableData = data.temperatureData.slice(0, 50).map((point) => [
      point.time,
      point.BIU1,
      point.BIU2,
      point.BIU3,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Time', 'BIU1 (°C)', 'BIU2 (°C)', 'BIU3 (°C)']],
      body: tempTableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    })
    yPos = doc.lastAutoTable.finalY + 10

    if (data.temperatureData.length > 50) {
      doc.setFontSize(9)
      doc.setFont(undefined, 'italic')
      doc.text(`Note: Showing first 50 of ${data.temperatureData.length} temperature readings.`, margin, yPos)
      yPos += 10
    }
  } else {
    checkNewPage(15)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('3. Temperature Monitoring', margin, yPos)
    yPos += 10
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text('No temperature data available for the selected timeframe.', margin, yPos)
    yPos += 15
  }

  // Network Connectivity Section
  checkNewPage(50)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('4. Network Connectivity', margin, yPos)
  yPos += 5
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text('This section shows network connectivity metrics including ICMP status, latency, and packet loss.', margin, yPos)
  yPos += 10

  // ICMP Status
  const icmpTableData = data.networkData.icmp.map((point) => [
    point.time,
    point.status === 1 ? 'Connected' : 'Disconnected',
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'ICMP Status']],
    body: icmpTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 10

  // Latency
  const latencyTableData = data.networkData.latency.map((point) => [
    point.time,
    `${point.latency} ms`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Latency (ms)']],
    body: latencyTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 10

  // Packet Loss
  const lossTableData = data.networkData.loss.map((point) => [
    point.time,
    `${point.loss}%`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Packet Loss (%)']],
    body: lossTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 15

  // RF Metrics Section
  checkNewPage(50)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('5. RF (Radio Frequency) Metrics', margin, yPos)
  yPos += 5
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text('This section shows RF transmission and reception power levels for each sector.', margin, yPos)
  yPos += 10

  // RF TX Data
  const rfTxTableData = data.rfData.tx.map((point) => [
    point.time,
    `${point.sector1} dBm`,
    `${point.sector2} dBm`,
    `${point.sector3} dBm`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Sector 1 TX (dBm)', 'Sector 2 TX (dBm)', 'Sector 3 TX (dBm)']],
    body: rfTxTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 10

  // RF RX Data
  const rfRxTableData = data.rfData.rx.map((point) => [
    point.time,
    `${point.sector1} dBm`,
    `${point.sector2} dBm`,
    `${point.sector3} dBm`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Sector 1 RX (dBm)', 'Sector 2 RX (dBm)', 'Sector 3 RX (dBm)']],
    body: rfRxTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 10

  // RF Averages
  const rfAvgTableData = data.rfData.averages.map((sector) => [
    `Sector ${sector.sector}`,
    `${sector.avg} dBm`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Sector', 'Average TX Power (dBm)']],
    body: rfAvgTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 15

  // Optical Metrics Section
  checkNewPage(50)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('6. Optical Metrics', margin, yPos)
  yPos += 5
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text('This section shows optical power levels (PD) and laser diode levels (LD) for each sector.', margin, yPos)
  yPos += 10

  // PD Level Data
  const pdTableData = data.opticalData.pd.map((point) => [
    point.time,
    `${point.sector1} V`,
    `${point.sector2} V`,
    `${point.sector3} V`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Sector 1 PD (V)', 'Sector 2 PD (V)', 'Sector 3 PD (V)']],
    body: pdTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 10

  // LD Level Data
  const ldTableData = data.opticalData.ld.map((point) => [
    point.time,
    `${point.sector1} mA`,
    `${point.sector2} mA`,
    `${point.sector3} mA`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Sector 1 LD (mA)', 'Sector 2 LD (mA)', 'Sector 3 LD (mA)']],
    body: ldTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  })
  yPos = doc.lastAutoTable.finalY + 15

  // Footer on last page
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont(undefined, 'italic')
    doc.text(
      `Page ${i} of ${pageCount} | System: ${data.systemInfo.systemName} | Generated: ${data.exportDate}`,
      margin,
      pageHeight - 10,
      { align: 'center' }
    )
  }

    // Save the PDF
    const fileName = `System_Report_${data.systemInfo.systemName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF: ' + error.message)
  }
}

/**
 * Generates a CSV file with all component data
 */
export function generateCSV(systemId) {
  try {
    const data = collectAllComponentData(systemId)
    
    let csvContent = ''
  
  // CSV Header
  csvContent += 'UPTIMEX SYSTEM MONITORING REPORT\n'
  csvContent += `Generated: ${data.exportDate}\n`
  csvContent += `System: ${data.systemInfo.systemName}\n`
  csvContent += `Timeframe: ${data.timeframe.dateFrom} ${data.timeframe.timeFrom} to ${data.timeframe.dateTo} ${data.timeframe.timeTo}\n`
  csvContent += '\n'

  // System Information
  csvContent += '=== SYSTEM INFORMATION ===\n'
  csvContent += 'Property,Value\n'
  csvContent += `System Name,${data.systemInfo.systemName}\n`
  csvContent += `Status,${data.systemInfo.status}\n`
  csvContent += `Location,${data.systemInfo.location}\n`
  csvContent += `OEM/Manufacturer,${data.systemInfo.oem}\n`
  csvContent += `System Type,${data.systemInfo.systemType}\n`
  csvContent += `Vendor,${data.systemInfo.vendor}\n`
  csvContent += `Property Type,${data.systemInfo.propertyType}\n`
  csvContent += `Target SLA,${data.systemInfo.targetSla}\n`
  csvContent += `Achieved SLA,${data.systemInfo.achievedSla}\n`
  csvContent += `Created At,${data.systemInfo.createdAt}\n`
  csvContent += '\n'

  // System Health
  csvContent += '=== SYSTEM HEALTH STATUS ===\n'
  csvContent += 'Metric,Value\n'
  csvContent += `Overall Status,${data.healthData.overallStatus}\n`
  csvContent += `Overall Availability,${data.healthData.overallAvailability}\n`
  csvContent += `Target SLA,${data.healthData.targetSla}\n`
  csvContent += '\n'

  // Temperature Data
  if (data.temperatureData.length > 0) {
    csvContent += '=== TEMPERATURE MONITORING ===\n'
    csvContent += 'Time,BIU1 (°C),BIU2 (°C),BIU3 (°C)\n'
    data.temperatureData.forEach((point) => {
      csvContent += `${point.time},${point.BIU1},${point.BIU2},${point.BIU3}\n`
    })
    csvContent += '\n'
  }

  // Network Connectivity
  csvContent += '=== NETWORK CONNECTIVITY ===\n'
  csvContent += 'ICMP Status\n'
  csvContent += 'Time,Status\n'
  data.networkData.icmp.forEach((point) => {
    csvContent += `${point.time},${point.status === 1 ? 'Connected' : 'Disconnected'}\n`
  })
  csvContent += '\n'

  csvContent += 'Latency\n'
  csvContent += 'Time,Latency (ms)\n'
  data.networkData.latency.forEach((point) => {
    csvContent += `${point.time},${point.latency}\n`
  })
  csvContent += '\n'

  csvContent += 'Packet Loss\n'
  csvContent += 'Time,Packet Loss (%)\n'
  data.networkData.loss.forEach((point) => {
    csvContent += `${point.time},${point.loss}\n`
  })
  csvContent += '\n'

  // RF Metrics
  csvContent += '=== RF METRICS ===\n'
  csvContent += 'RF TX Power\n'
  csvContent += 'Time,Sector 1 TX (dBm),Sector 2 TX (dBm),Sector 3 TX (dBm)\n'
  data.rfData.tx.forEach((point) => {
    csvContent += `${point.time},${point.sector1},${point.sector2},${point.sector3}\n`
  })
  csvContent += '\n'

  csvContent += 'RF RX Power\n'
  csvContent += 'Time,Sector 1 RX (dBm),Sector 2 RX (dBm),Sector 3 RX (dBm)\n'
  data.rfData.rx.forEach((point) => {
    csvContent += `${point.time},${point.sector1},${point.sector2},${point.sector3}\n`
  })
  csvContent += '\n'

  csvContent += 'RF Average TX Power\n'
  csvContent += 'Sector,Average TX Power (dBm)\n'
  data.rfData.averages.forEach((sector) => {
    csvContent += `Sector ${sector.sector},${sector.avg}\n`
  })
  csvContent += '\n'

  // Optical Metrics
  csvContent += '=== OPTICAL METRICS ===\n'
  csvContent += 'PD Level\n'
  csvContent += 'Time,Sector 1 PD (V),Sector 2 PD (V),Sector 3 PD (V)\n'
  data.opticalData.pd.forEach((point) => {
    csvContent += `${point.time},${point.sector1},${point.sector2},${point.sector3}\n`
  })
  csvContent += '\n'

  csvContent += 'LD Level\n'
  csvContent += 'Time,Sector 1 LD (mA),Sector 2 LD (mA),Sector 3 LD (mA)\n'
  data.opticalData.ld.forEach((point) => {
    csvContent += `${point.time},${point.sector1},${point.sector2},${point.sector3}\n`
  })
  csvContent += '\n'

    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    const fileName = `System_Report_${data.systemInfo.systemName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating CSV:', error)
    throw new Error('Failed to generate CSV: ' + error.message)
  }
}

