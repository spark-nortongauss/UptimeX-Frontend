import { apiRequest, unwrapResponse } from '../apiWrapper'
import { authService } from './authService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

class WanNetworkService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/wan-network`
  }

  async getAuthHeaders() {
    const sessionToken = await authService.getSessionToken()
    if (!sessionToken) {
      throw new Error('No authentication token available')
    }

    return {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    }
  }

  async makeRequest(endpoint, options = {}) {
    const headers = await this.getAuthHeaders()
    const response = await apiRequest(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    return unwrapResponse(response, `WAN network API request failed for ${endpoint}`)
  }

  buildQueryString(params = {}) {
    const query = new URLSearchParams()
    if (params.timeRange) query.append('timeRange', params.timeRange)
    if (params.limit) query.append('limit', params.limit)
    if (params.time_from) query.append('time_from', params.time_from)
    if (params.time_till) query.append('time_till', params.time_till)
    return query.toString()
  }

  async getIcmpStatus(params = {}) {
    const hostids = params.hostids
    if (!hostids || (Array.isArray(hostids) && hostids.length === 0)) {
      throw new Error('hostids parameter is required')
    }

    const query = new URLSearchParams()
    if (Array.isArray(hostids)) {
      query.append('hostids', hostids.join(','))
    } else {
      query.append('hostids', hostids)
    }

    if (params.timeRange) query.append('timeRange', params.timeRange)
    if (params.limit) query.append('limit', params.limit)
    if (params.time_from) query.append('time_from', params.time_from)
    if (params.time_till) query.append('time_till', params.time_till)

    const endpoint = `/icmp-status?${query.toString()}`
    return await this.makeRequest(endpoint)
  }

  async getIcmpStatusByHost(hostId, params = {}) {
    if (!hostId) {
      throw new Error('hostId is required')
    }

    const queryString = this.buildQueryString(params)
    const endpoint = `/icmp-status/${hostId}${queryString ? `?${queryString}` : ''}`
    return await this.makeRequest(endpoint)
  }

  async getIcmpHistory(hostId, params = {}) {
    if (!hostId) {
      throw new Error('hostId is required')
    }

    const queryString = this.buildQueryString(params)
    const endpoint = `/icmp-status/${hostId}/history${queryString ? `?${queryString}` : ''}`
    return await this.makeRequest(endpoint)
  }

  async getStatus(hostId, params = {}) {
    if (!hostId) {
      throw new Error('hostId is required')
    }

    const query = new URLSearchParams()
    if (params.timeRange) query.append('timeRange', params.timeRange)
    if (params.from) query.append('from', params.from)
    if (params.till) query.append('till', params.till)
    if (params.limit) query.append('limit', params.limit)

    const endpoint = `/status/${hostId}${query.toString() ? `?${query.toString()}` : ''}`
    return await this.makeRequest(endpoint)
  }
}

const wanNetworkService = new WanNetworkService()

export { wanNetworkService }
export default wanNetworkService

