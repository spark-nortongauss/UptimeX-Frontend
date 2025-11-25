import { apiRequest, unwrapResponse } from '../apiWrapper'
import { authService } from './authService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

class TicketsService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/tickets`
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

  async createTicket(ticketData) {
    const headers = await this.getAuthHeaders()
    const response = await apiRequest(this.baseURL, {
      method: 'POST',
      headers,
      body: JSON.stringify(ticketData),
    })

    return unwrapResponse(response, 'Failed to create ticket')
  }

  async listTickets(category) {
    const headers = await this.getAuthHeaders()
    const url = category 
      ? `${this.baseURL}?category=${encodeURIComponent(category)}`
      : this.baseURL
    const response = await apiRequest(url, {
      method: 'GET',
      headers,
    })

    return unwrapResponse(response, 'Failed to fetch tickets')
  }

  async updateTicket(ticketId, updates) {
    const headers = await this.getAuthHeaders()
    const response = await apiRequest(`${this.baseURL}/${ticketId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    })

    return unwrapResponse(response, 'Failed to update ticket')
  }

  async deleteTicket(ticketId) {
    const headers = await this.getAuthHeaders()
    const response = await apiRequest(`${this.baseURL}/${ticketId}`, {
      method: 'DELETE',
      headers,
    })

    return unwrapResponse(response, 'Failed to delete ticket')
  }
}

export const ticketsService = new TicketsService()
export default ticketsService

