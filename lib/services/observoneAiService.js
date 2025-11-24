import { apiRequest, unwrapResponse } from '../apiWrapper';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

class ObservoneAiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/observone/ai`;
  }

  async getAuthHeaders() {
    const sessionToken = await authService.getSessionToken();
    if (!sessionToken) {
      throw new Error('No authentication token available');
    }

    return {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    };
  }

  async diagnoseAlarm(payload) {
    const headers = await this.getAuthHeaders();

    const response = await apiRequest(`${this.baseURL}/diagnose`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    return unwrapResponse(response, 'Failed to run ObservOne AI diagnosis');
  }
}

export const observoneAiService = new ObservoneAiService();

