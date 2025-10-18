import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

class ZabbixService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/zabbix`;
    this.token = null;
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
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Zabbix API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(username, password) {
    try {
      const response = await this.makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (response.success && response.token) {
        this.token = response.token;
        // Store token in localStorage for persistence
        localStorage.setItem('zabbix_token', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Zabbix login failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await this.makeRequest('/logout', {
        method: 'POST',
      });
      
      // Clear stored token
      this.token = null;
      localStorage.removeItem('zabbix_token');
      
      return response;
    } catch (error) {
      console.error('Zabbix logout failed:', error);
      throw error;
    }
  }

  async checkAuthentication() {
    try {
      const response = await this.makeRequest('/auth/check');
      return response;
    } catch (error) {
      console.error('Zabbix authentication check failed:', error);
      return { success: false, authenticated: false };
    }
  }

  // System information methods
  async getApiInfo() {
    try {
      const response = await this.makeRequest('/info');
      return response;
    } catch (error) {
      console.error('Failed to get Zabbix API info:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await this.makeRequest('/test-connection');
      return response;
    } catch (error) {
      console.error('Zabbix connection test failed:', error);
      return { success: false, connected: false };
    }
  }

  async getSystemStatus() {
    try {
      const response = await this.makeRequest('/status');
      return response;
    } catch (error) {
      console.error('Failed to get system status:', error);
      throw error;
    }
  }

  // Host management methods
  async getHosts(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Handle array parameters
      if (params.groupids) {
        params.groupids.forEach(id => queryString.append('groupids', id));
      }
      if (params.templateids) {
        params.templateids.forEach(id => queryString.append('templateids', id));
      }
      
      // Handle simple parameters
      if (params.monitored !== undefined) {
        queryString.append('monitored', params.monitored);
      }
      if (params.limit) {
        queryString.append('limit', params.limit);
      }
      
      // Handle search object
      if (params.search) {
        Object.entries(params.search).forEach(([key, value]) => {
          queryString.append(`search[${key}]`, value);
        });
      }
      
      // Handle filter object
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          queryString.append(`filter[${key}]`, value);
        });
      }
      
      const endpoint = `/hosts${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get hosts:', error);
      throw error;
    }
  }

  async getHostById(hostId) {
    try {
      const response = await this.makeRequest(`/hosts/${hostId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get host ${hostId}:`, error);
      throw error;
    }
  }

  // Item management methods
  async getItems(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Handle array parameters
      if (params.hostids) {
        params.hostids.forEach(id => queryString.append('hostids', id));
      }
      if (params.groupids) {
        params.groupids.forEach(id => queryString.append('groupids', id));
      }
      if (params.templateids) {
        params.templateids.forEach(id => queryString.append('templateids', id));
      }
      
      // Handle simple parameters
      if (params.monitored !== undefined) {
        queryString.append('monitored', params.monitored);
      }
      if (params.limit) {
        queryString.append('limit', params.limit);
      }
      
      // Handle search and filter objects
      if (params.search) {
        Object.entries(params.search).forEach(([key, value]) => {
          queryString.append(`search[${key}]`, value);
        });
      }
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          queryString.append(`filter[${key}]`, value);
        });
      }
      
      const endpoint = `/items${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get items:', error);
      throw error;
    }
  }

  async getItemsByHostId(hostId) {
    try {
      const response = await this.makeRequest(`/hosts/${hostId}/items`);
      return response;
    } catch (error) {
      console.error(`Failed to get items for host ${hostId}:`, error);
      throw error;
    }
  }

  // Trigger management methods
  async getTriggers(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Handle array parameters
      if (params.hostids) {
        params.hostids.forEach(id => queryString.append('hostids', id));
      }
      if (params.groupids) {
        params.groupids.forEach(id => queryString.append('groupids', id));
      }
      if (params.templateids) {
        params.templateids.forEach(id => queryString.append('templateids', id));
      }
      
      // Handle simple parameters
      if (params.monitored !== undefined) {
        queryString.append('monitored', params.monitored);
      }
      if (params.active !== undefined) {
        queryString.append('active', params.active);
      }
      if (params.limit) {
        queryString.append('limit', params.limit);
      }
      
      // Handle search and filter objects
      if (params.search) {
        Object.entries(params.search).forEach(([key, value]) => {
          queryString.append(`search[${key}]`, value);
        });
      }
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          queryString.append(`filter[${key}]`, value);
        });
      }
      
      const endpoint = `/triggers${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get triggers:', error);
      throw error;
    }
  }

  async getTriggersByHostId(hostId) {
    try {
      const response = await this.makeRequest(`/hosts/${hostId}/triggers`);
      return response;
    } catch (error) {
      console.error(`Failed to get triggers for host ${hostId}:`, error);
      throw error;
    }
  }

  // Problem management methods
  async getProblems(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Handle array parameters
      if (params.hostids) {
        params.hostids.forEach(id => queryString.append('hostids', id));
      }
      if (params.groupids) {
        params.groupids.forEach(id => queryString.append('groupids', id));
      }
      if (params.objectids) {
        params.objectids.forEach(id => queryString.append('objectids', id));
      }
      if (params.eventids) {
        params.eventids.forEach(id => queryString.append('eventids', id));
      }
      if (params.severities) {
        params.severities.forEach(severity => queryString.append('severities', severity));
      }
      
      // Handle simple parameters
      if (params.time_from) {
        queryString.append('time_from', params.time_from);
      }
      if (params.time_till) {
        queryString.append('time_till', params.time_till);
      }
      if (params.acknowledged !== undefined) {
        queryString.append('acknowledged', params.acknowledged);
      }
      if (params.suppressed !== undefined) {
        queryString.append('suppressed', params.suppressed);
      }
      if (params.limit) {
        queryString.append('limit', params.limit);
      }
      
      // Handle tags array
      if (params.tags) {
        params.tags.forEach((tag, index) => {
          queryString.append(`tags[${index}][tag]`, tag.tag);
          if (tag.value) {
            queryString.append(`tags[${index}][value]`, tag.value);
          }
          if (tag.operator) {
            queryString.append(`tags[${index}][operator]`, tag.operator);
          }
        });
      }
      
      const endpoint = `/problems${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get problems:', error);
      throw error;
    }
  }

  // History data methods
  async getHistory(params = {}) {
    try {
      if (!params.itemids || params.itemids.length === 0) {
        throw new Error('itemids parameter is required');
      }
      
      const queryString = new URLSearchParams();
      
      // Handle required itemids array
      params.itemids.forEach(id => queryString.append('itemids', id));
      
      // Handle optional parameters
      if (params.history !== undefined) {
        queryString.append('history', params.history);
      }
      if (params.time_from) {
        queryString.append('time_from', params.time_from);
      }
      if (params.time_till) {
        queryString.append('time_till', params.time_till);
      }
      if (params.limit) {
        queryString.append('limit', params.limit);
      }
      
      const endpoint = `/history?${queryString.toString()}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get history:', error);
      throw error;
    }
  }

  // Utility methods
  getStoredToken() {
    return localStorage.getItem('zabbix_token');
  }

  clearStoredToken() {
    localStorage.removeItem('zabbix_token');
    this.token = null;
  }

  isAuthenticated() {
    return !!(this.token || this.getStoredToken());
  }

  // Initialize token from storage
  init() {
    const storedToken = this.getStoredToken();
    if (storedToken) {
      this.token = storedToken;
    }
  }
}

// Create and export a singleton instance
const zabbixService = new ZabbixService();

// Initialize on import
if (typeof window !== 'undefined') {
  zabbixService.init();
}

export { zabbixService };
export default zabbixService;