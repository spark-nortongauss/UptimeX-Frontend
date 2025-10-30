/**
 * Geocoding service to convert latitude/longitude coordinates to readable location names
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

class GeocodingService {
  constructor() {
    this.cache = new Map()
    this.baseUrl = 'https://nominatim.openstreetmap.org/reverse'
    this.requestDelay = 1000 // 1 second delay between requests to respect rate limits
    this.lastRequestTime = 0
  }

  /**
   * Convert latitude and longitude to a readable location name
   * @param {string|number} lat - Latitude
   * @param {string|number} lon - Longitude
   * @returns {Promise<string>} - Readable location name
   */
  async getLocationName(lat, lon) {
    if (!lat || !lon) {
      return 'Location not available'
    }

    // Create cache key
    const cacheKey = `${lat},${lon}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      // Respect rate limits
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.requestDelay) {
        await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest))
      }

      const response = await fetch(
        `${this.baseUrl}?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UptimeX-Monitoring-App/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      this.lastRequestTime = Date.now()

      // Extract readable location from response
      let locationName = this.extractLocationName(data)
      
      // Cache the result
      this.cache.set(cacheKey, locationName)
      
      return locationName
    } catch (error) {
      console.warn(`Geocoding failed for ${lat},${lon}:`, error.message)
      // Return coordinates as fallback
      return `${lat}, ${lon}`
    }
  }

  /**
   * Extract a readable location name from Nominatim response
   * @param {Object} data - Nominatim API response
   * @returns {string} - Formatted location name
   */
  extractLocationName(data) {
    if (!data || !data.address) {
      return 'Unknown location'
    }

    const addr = data.address
    const parts = []

    // Try to build a meaningful address in order of preference
    if (addr.city) parts.push(addr.city)
    else if (addr.town) parts.push(addr.town)
    else if (addr.village) parts.push(addr.village)
    else if (addr.hamlet) parts.push(addr.hamlet)

    if (addr.state) parts.push(addr.state)
    else if (addr.county) parts.push(addr.county)

    if (addr.country) parts.push(addr.country)

    // If we have a good address, return it
    if (parts.length > 0) {
      return parts.join(', ')
    }

    // Fallback to display_name if available
    if (data.display_name) {
      // Take first part of display_name (usually the most specific location)
      const displayParts = data.display_name.split(', ')
      return displayParts.slice(0, 3).join(', ') // Take first 3 parts
    }

    return 'Unknown location'
  }

  /**
   * Batch geocode multiple coordinates
   * @param {Array} coordinates - Array of {lat, lon} objects
   * @returns {Promise<Array>} - Array of location names
   */
  async batchGeocode(coordinates) {
    const results = []
    
    for (const coord of coordinates) {
      const locationName = await this.getLocationName(coord.lat, coord.lon)
      results.push(locationName)
    }
    
    return results
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService()
export default geocodingService
