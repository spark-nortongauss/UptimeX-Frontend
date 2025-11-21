import jsPDF from 'jspdf'
import { captureApexChart, captureElementAsImage, waitForRender } from './chartCapturer'
import { useSystemSelectionStore } from '@/lib/stores/systemSelectionStore'
import { useTimeframeFilterStore } from '@/lib/stores/timeframeFilterStore'

/**
 * Collects system information for the report
 */
function collectSystemInfo(systemId) {
  const systemStore = useSystemSelectionStore.getState()
  const timeframeStore = useTimeframeFilterStore.getState()
  const system = systemStore.systemsById[systemId]

  const inventory = system?.inventory || {}
  const availability = system?.achievedSla
    ? Number(String(system.achievedSla).replace('%', ''))
    : undefined

  return {
    systemName: system?.name || systemId || 'Unknown',
    status: system?.status || 'Unknown',
    location: system?.location || 'N/A',
    oem:
      inventory.oem ||
      inventory.manufacturer ||
      inventory.hardware ||
      inventory.model ||
      'N/A',
    systemType: inventory.type_full || system?.type || 'N/A',
    vendor: inventory.vendor || 'N/A',
    propertyType: inventory.property_type || inventory.type || 'N/A',
    availability: availability !== undefined ? `${availability.toFixed(2)}%` : 'N/A',
    targetSla: system?.targetSla || 'N/A',
    dateFrom: timeframeStore.dateFrom,
    dateTo: timeframeStore.dateTo,
    timeFrom: timeframeStore.timeFrom,
    timeTo: timeframeStore.timeTo,
    exportDate: new Date().toLocaleString(),
  }
}

/**
 * Generates a comprehensive PDF report with all charts and data
 * @param {string} systemId - The system ID
 * @param {Object} chartRefs - Object containing refs to all chart components
 * @param {Function} onProgress - Optional progress callback
 */
export async function generateReportPDF(systemId, chartRefs = {}, onProgress) {
  try {
    if (onProgress) onProgress('Collecting system information...')

    const systemInfo = collectSystemInfo(systemId)
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin

    // Helper to add new page
    const addNewPage = () => {
      doc.addPage()
      yPos = margin
    }

    // Helper to check if new page needed
    const checkNewPage = (requiredHeight) => {
      if (yPos + requiredHeight > pageHeight - margin) {
        addNewPage()
        return true
      }
      return false
    }

    // Helper to add image with proper sizing
    const addImage = async (imageData, maxWidth, maxHeight, label = '') => {
      // Support both old format (string) and new format (object with dataUrl, width, height)
      const dataUrl = typeof imageData === 'string' ? imageData : imageData?.dataUrl
      const imgWidth = typeof imageData === 'object' ? imageData.width : null
      const imgHeight = typeof imageData === 'object' ? imageData.height : null

      if (!dataUrl) {
        checkNewPage(10)
        doc.setFontSize(10)
        doc.text(label || 'Chart not available', margin, yPos)
        yPos += 10
        return
      }

      try {
        let finalWidth, finalHeight

        if (imgWidth && imgHeight) {
          // Use provided dimensions (from canvas)
          // Convert pixels to mm (assuming 96 DPI, scale 2 from html2canvas)
          const pxToMm = 0.264583
          finalWidth = imgWidth * pxToMm
          finalHeight = imgHeight * pxToMm
        } else {
          // Fallback: load image to get dimensions
          const img = document.createElement('img')
          img.src = dataUrl

          await new Promise((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject(new Error('Failed to load image'))
            setTimeout(() => reject(new Error('Image load timeout')), 5000)
          })

          const pxToMm = 0.264583
          finalWidth = (img.naturalWidth || img.width) * pxToMm
          finalHeight = (img.naturalHeight || img.height) * pxToMm
        }

        // Calculate dimensions to fit within maxWidth and maxHeight
        const widthRatio = maxWidth / finalWidth
        const heightRatio = maxHeight / finalHeight
        const ratio = Math.min(widthRatio, heightRatio, 1)

        finalWidth = finalWidth * ratio
        finalHeight = finalHeight * ratio

        checkNewPage(finalHeight + 10)

        doc.addImage(dataUrl, 'PNG', margin, yPos, finalWidth, finalHeight)
        yPos += finalHeight + 10
      } catch (error) {
        console.error('Error adding image:', error)
        checkNewPage(10)
        doc.setFontSize(10)
        doc.text(label || 'Error loading chart', margin, yPos)
        yPos += 10
      }
    }

    const resolveImageInfo = async (imageData) => {
      const dataUrl = typeof imageData === 'string' ? imageData : imageData?.dataUrl
      if (!dataUrl) return null

      let width = typeof imageData === 'object' ? imageData.width : null
      let height = typeof imageData === 'object' ? imageData.height : null

      if (!width || !height) {
        const img = document.createElement('img')
        img.src = dataUrl

        await new Promise((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load image'))
          setTimeout(() => reject(new Error('Image load timeout')), 5000)
        })

        width = img.naturalWidth || img.width
        height = img.naturalHeight || img.height
      }

      const pxToMm = 0.264583
      return {
        dataUrl,
        width: width * pxToMm,
        height: height * pxToMm,
      }
    }

    const waitForChartReady = async (instanceRef, attempts = 5, delay = 200) => {
      if (!instanceRef) return null

      for (let i = 0; i < attempts; i += 1) {
        if (instanceRef.current) {
          return instanceRef.current
        }
        await waitForRender(delay)
      }

      return instanceRef.current || null
    }

    // ========== PAGE 1: COVER PAGE ==========
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('System Monitoring Report', margin, yPos)
    yPos += 15

    doc.setFontSize(16)
    doc.setFont(undefined, 'normal')
    doc.text(systemInfo.systemName, margin, yPos)
    yPos += 20

    doc.setFontSize(12)
    doc.text(`Generated: ${systemInfo.exportDate}`, margin, yPos)
    yPos += 7
    doc.text(
      `Timeframe: ${systemInfo.dateFrom} ${systemInfo.timeFrom} - ${systemInfo.dateTo} ${systemInfo.timeTo}`,
      margin,
      yPos
    )
    yPos += 15

    // System Information Table
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('System Information', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    const infoRows = [
      ['Status', systemInfo.status],
      ['Location', systemInfo.location],
      ['OEM', systemInfo.oem],
      ['System Type', systemInfo.systemType],
      ['Vendor', systemInfo.vendor],
      ['Property Type', systemInfo.propertyType],
      ['Availability', systemInfo.availability],
      ['Target SLA', systemInfo.targetSla],
    ]

    infoRows.forEach(([label, value]) => {
      checkNewPage(7)
      doc.setFont(undefined, 'bold')
      doc.text(`${label}:`, margin, yPos)
      doc.setFont(undefined, 'normal')
      doc.text(value, margin + 50, yPos)
      yPos += 7
    })

    yPos += 10

    // ========== CAPTURE AND ADD CHARTS ==========
    if (onProgress) onProgress('Exporting charts...')

    // Get chart instances for fast export (no waiting needed - charts are already rendered)
    const chartInstances = chartRefs.chartInstances || {}

    // 1. System Health Cards (non-chart, use html2canvas)
    if (chartRefs.healthCards?.current) {
      checkNewPage(60)
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text('Overall System Status / Availability', margin, yPos)
      yPos += 10

      try {
        const healthImage = await captureElementAsImage(chartRefs.healthCards.current, {
          backgroundColor: '#ffffff',
          scale: 1, // Lower scale for speed
        })
        await addImage(healthImage, contentWidth, 60, 'System Health Cards')
      } catch (error) {
        console.error('Error capturing health cards:', error)
        doc.setFontSize(10)
        doc.text('System Health Cards: Not available', margin, yPos)
        yPos += 10
      }
    }

    // 2. Temperature Chart (FAST - ApexChart native export)
    if (chartInstances.temperature) {
      const temperatureChart = await waitForChartReady(chartInstances.temperature)
      if (temperatureChart) {
        checkNewPage(80)
        doc.setFontSize(16)
        doc.setFont(undefined, 'bold')
        doc.text('Temperature Monitoring', margin, yPos)
        yPos += 10

        try {
          const tempImage = await captureApexChart(temperatureChart)
          await addImage(tempImage, contentWidth, 80, 'Temperature Chart')
        } catch (error) {
          console.error('Error capturing temperature chart:', error)
          doc.setFontSize(10)
          doc.text('Temperature Chart: Not available', margin, yPos)
          yPos += 10
        }
      } else {
        doc.setFontSize(10)
        doc.text('Temperature Chart: Not ready', margin, yPos)
        yPos += 10
      }
    }

    // 3. Network Connectivity Charts (FAST - ApexChart native export)
    if (chartInstances.network) {
      const networkCharts = [
        { ref: chartInstances.network.icmp, name: 'WAN ICMP Status' },
        { ref: chartInstances.network.latency, name: 'WAN Latency' },
        { ref: chartInstances.network.loss, name: 'WAN ICMP Loss' },
      ]

      let sectionTitleAdded = false
      for (const chart of networkCharts) {
        const instance = await waitForChartReady(chart.ref)
        if (instance) {
          checkNewPage(80)
          if (!sectionTitleAdded) {
            doc.setFontSize(16)
            doc.setFont(undefined, 'bold')
            doc.text('Network Connectivity', margin, yPos)
            yPos += 10
            sectionTitleAdded = true
          }

          try {
            const chartImage = await captureApexChart(instance)
            await addImage(chartImage, contentWidth, 70, chart.name)
          } catch (error) {
            console.error(`Error capturing ${chart.name}:`, error)
            doc.setFontSize(10)
            doc.text(`${chart.name}: Not available`, margin, yPos)
            yPos += 10
          }
        } else if (chart.ref) {
          doc.setFontSize(10)
          doc.text(`${chart.name}: Not ready`, margin, yPos)
          yPos += 10
        }
      }
    }

    // 4. RF Metrics Charts (FAST - ApexChart native export for charts, html2canvas for power cards)
    if (chartRefs.rfMetrics || chartInstances.rf) {
      checkNewPage(80)
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text('RF Status', margin, yPos)
      yPos += 10

      const sectors = [1, 2, 3]
      
      // First, capture all power cards and add them side by side
      const powerCardImages = []
      for (const sector of sectors) {
        const sectorKey = `sector${sector}`
        const sectorRefs = chartRefs.rfMetrics?.[sectorKey]
        
        if (sectorRefs?.powerCard?.current) {
          try {
            const powerImage = await captureElementAsImage(sectorRefs.powerCard.current, {
              backgroundColor: '#ffffff',
              scale: 1, // Lower scale for speed
            })
            powerCardImages.push({ image: powerImage, sector })
          } catch (error) {
            console.error(`Error capturing sector ${sector} power card:`, error)
          }
        }
      }
      
      // Add power cards side by side
      if (powerCardImages.length > 0) {
        checkNewPage(50)
        const columns = powerCardImages.length
        const cardSpacing = 5
        const cardWidth = (contentWidth - cardSpacing * (columns - 1)) / columns
        let maxCardHeight = 0

        for (let index = 0; index < powerCardImages.length; index += 1) {
          const { image, sector } = powerCardImages[index]
          try {
            const info = await resolveImageInfo(image)
            if (!info) continue

            const widthRatio = cardWidth / info.width
            const heightRatio = 40 / info.height
            const ratio = Math.min(widthRatio, heightRatio, 1)

            const finalWidth = info.width * ratio
            const finalHeight = info.height * ratio
            maxCardHeight = Math.max(maxCardHeight, finalHeight)

            const xPos = margin + index * (cardWidth + cardSpacing)
            doc.addImage(info.dataUrl, 'PNG', xPos, yPos, finalWidth, finalHeight)
          } catch (error) {
            console.error(`Error adding sector ${sector} power card:`, error)
          }
        }
        
        yPos += maxCardHeight + 10
      }

      // Then add charts for each sector
      for (const sector of sectors) {
        const sectorKey = `sector${sector}`
        const sectorInstances = chartInstances.rf?.[sectorKey]

        // RF TX Chart (FAST - ApexChart native export)
        const txInstance = await waitForChartReady(sectorInstances?.txChart)
        if (txInstance) {
          try {
            const txImage = await captureApexChart(txInstance)
            await addImage(txImage, contentWidth, 70, `Sector ${sector} MU RF TX IN`)
          } catch (error) {
            console.error(`Error capturing sector ${sector} TX chart:`, error)
          }
        }

        // RF RX Chart (FAST - ApexChart native export)
        const rxInstance = await waitForChartReady(sectorInstances?.rxChart)
        if (rxInstance) {
          try {
            const rxImage = await captureApexChart(rxInstance)
            await addImage(rxImage, contentWidth, 70, `Sector ${sector} RU RX Out`)
          } catch (error) {
            console.error(`Error capturing sector ${sector} RX chart:`, error)
          }
        }
      }
    }

    // 5. Optical Charts (FAST - ApexChart native export)
    if (chartInstances.optical) {
      checkNewPage(80)
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text('Optical Status', margin, yPos)
      yPos += 10

      const sectors = [1, 2, 3]
      for (const sector of sectors) {
        // PD Level Chart (FAST - ApexChart native export)
        const pdInstance = await waitForChartReady(chartInstances.optical[`pdSector${sector}`])
        if (pdInstance) {
          try {
            const pdImage = await captureApexChart(pdInstance)
            await addImage(pdImage, contentWidth / 3, 60, `Sector ${sector} PD Level`)
          } catch (error) {
            console.error(`Error capturing sector ${sector} PD chart:`, error)
          }
        }

        // LD Level Chart (FAST - ApexChart native export)
        const ldInstance = await waitForChartReady(chartInstances.optical[`ldSector${sector}`])
        if (ldInstance) {
          try {
            const ldImage = await captureApexChart(ldInstance)
            await addImage(ldImage, contentWidth / 3, 60, `Sector ${sector} LD Level`)
          } catch (error) {
            console.error(`Error capturing sector ${sector} LD chart:`, error)
          }
        }
      }
    }

    // ========== ADD FOOTER TO ALL PAGES ==========
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont(undefined, 'italic')
      const footerText = `Page ${i} of ${pageCount} | ${systemInfo.systemName} | ${systemInfo.exportDate}`
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }

    // ========== SAVE PDF ==========
    if (onProgress) onProgress('Generating PDF...')

    const fileName = `${systemInfo.systemName.replace(/[^a-z0-9]/gi, '_')}_Report_${new Date()
      .toISOString()
      .split('T')[0]}.pdf`
    doc.save(fileName)

    if (onProgress) onProgress('Complete!')

    return { success: true, fileName }
  } catch (error) {
    console.error('Error generating report PDF:', error)
    throw new Error(`Failed to generate PDF report: ${error.message}`)
  }
}

