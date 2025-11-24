import html2canvas from 'html2canvas'

/**
 * Captures an ApexChart instance using its native dataURI method (FAST - instant export)
 * @param {Object} chartInstance - ApexChart instance
 * @returns {Promise<{dataUrl: string, width: number, height: number}>} - Base64 data URL and dimensions
 */
export async function captureApexChart(chartInstance) {
  if (!chartInstance) {
    throw new Error('Chart instance is required')
  }

  try {
    // ApexCharts native export - instant, no DOM rendering needed
    // dataURI uses a callback pattern, so we wrap it in a Promise
    const dataUri = await new Promise((resolve, reject) => {
      try {
        // Set a timeout in case the callback never fires
        const timeout = setTimeout(() => {
          reject(new Error('Chart export timeout'))
        }, 5000)

        chartInstance.dataURI({
          callback: (dataUri) => {
            clearTimeout(timeout)
            if (dataUri) {
              resolve(dataUri)
            } else {
              reject(new Error('Chart export returned empty data'))
            }
          },
        })
      } catch (error) {
        reject(error)
      }
    })

    // Get chart dimensions from the instance
    // ApexCharts stores dimensions in w.globals
    const width = chartInstance.w?.globals?.svgWidth || chartInstance.w?.globals?.chartWidth || 800
    const height = chartInstance.w?.globals?.svgHeight || chartInstance.w?.globals?.chartHeight || 400

    return {
      dataUrl: dataUri,
      width,
      height,
    }
  } catch (error) {
    console.error('Error capturing ApexChart:', error)
    throw new Error(`Failed to capture chart: ${error.message}`)
  }
}

/**
 * Captures a DOM element as an image using html2canvas (SLOW - only for non-chart elements)
 * @param {HTMLElement} element - The DOM element to capture
 * @param {Object} options - html2canvas options
 * @returns {Promise<{dataUrl: string, width: number, height: number}>} - Base64 data URL and dimensions
 */
export async function captureElementAsImage(element, options = {}) {
  if (!element) {
    throw new Error('Element is required for capture')
  }

  const defaultOptions = {
    backgroundColor: '#ffffff',
    scale: 1, // Lower scale for faster capture
    logging: false,
    useCORS: true,
    allowTaint: false,
    ...options,
  }

  try {
    const canvas = await html2canvas(element, defaultOptions)
    return {
      dataUrl: canvas.toDataURL('image/png', 0.9), // Slightly lower quality for speed
      width: canvas.width,
      height: canvas.height,
    }
  } catch (error) {
    console.error('Error capturing element:', error)
    throw new Error(`Failed to capture element: ${error.message}`)
  }
}

/**
 * Waits for a specified time (useful for ensuring charts are fully rendered)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function waitForRender(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
