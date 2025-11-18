import { apiRequest, unwrapResponse } from '../apiWrapper';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

class AlarmsService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/alarms`;
  }

  // Helper method to get authorization headers
  async getAuthHeaders() {
    const sessionToken = await authService.getSessionToken();
    if (!sessionToken) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Helper method to make authenticated requests
  async makeRequest(endpoint, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await apiRequest(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      return unwrapResponse(response, `Alarms API request failed for ${endpoint}`);
    } catch (error) {
      console.error(`Alarms API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get active alarms from Supabase
  async getActiveAlarms(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Add query parameters
      if (params.limit) queryString.append('limit', params.limit.toString());
      if (params.offset) queryString.append('offset', params.offset.toString());
      if (params.severity) queryString.append('severity', params.severity);
      if (params.status) queryString.append('status', params.status);
      if (params.host) queryString.append('host', params.host);
      if (params.group) queryString.append('group', params.group);
      if (params.acknowledged !== undefined) queryString.append('acknowledged', params.acknowledged.toString());
      
      const endpoint = queryString.toString() ? `?${queryString.toString()}` : '';
      const response = await this.makeRequest(endpoint);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          count: response.count,
        };
      } else {
        throw new Error(response.message || 'Failed to fetch alarms');
      }
    } catch (error) {
      console.error('Failed to get active alarms:', error);
      throw error;
    }
  }

  // Get alarm statistics
  async getStatistics() {
    try {
      const response = await this.makeRequest('/statistics');
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Failed to get alarm statistics:', error);
      throw error;
    }
  }

  // Trigger manual sync
  async triggerSync() {
    try {
      const response = await this.makeRequest('/sync', {
        method: 'POST',
      });
      
      return response;
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      throw error;
    }
  }

  // Acknowledge alarm
  async acknowledgeAlarm(eventId, message) {
    try {
      const response = await this.makeRequest(`/${eventId}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify(message ? { message } : {}),
      });
      
      return response;
    } catch (error) {
      console.error('Failed to acknowledge alarm:', error);
      throw error;
    }
  }

  // Get alarm by event ID
  async getAlarmByEventId(eventId) {
    try {
      const response = await this.makeRequest(`/${eventId}`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.message || 'Failed to fetch alarm');
      }
    } catch (error) {
      console.error('Failed to get alarm by event ID:', error);
      throw error;
    }
  }

  // Transform Supabase alarm data to match frontend format
  transformSupabaseAlarm(alarm) {
    return {
      id: alarm.eventid,
      host: alarm.host_name,
      hostId: alarm.host_id,
      group: alarm.host_group,
      groupId: alarm.host_group_id,
      severity: alarm.severity,
      status: alarm.status,
      problem: alarm.problem_description,
      age: alarm.age,
      time: alarm.formatted_time,
      timestamp: alarm.timestamp,
      acknowledged: alarm.acknowledged,
      opdata: alarm.opdata,
      tags: alarm.tags || [],
      urls: alarm.urls || [],
      matchedBy: alarm.matched_by,
    };
  }

  // Transform multiple Supabase alarms
  transformSupabaseAlarms(alarms) {
    return alarms.map(alarm => this.transformSupabaseAlarm(alarm));
  }
}

// Create and export a singleton instance
const alarmsService = new AlarmsService();

export { alarmsService };
export default alarmsService;