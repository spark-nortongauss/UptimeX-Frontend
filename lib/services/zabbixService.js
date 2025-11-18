import { apiRequest, unwrapResponse } from '../apiWrapper';
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
      
      const response = await apiRequest(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      return unwrapResponse(response, `Zabbix API request failed for ${endpoint}`);
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

  // Enhanced problems with host and host group data
  async getProblemsWithHostData(params = {}) {
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
      
      const endpoint = `/problems-enhanced${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get enhanced problems:', error);
      throw error;
    }
  }

  // Get complete historical data for a problem event
  async getProblemEventHistory(eventId) {
    try {
      const endpoint = `/problems/${eventId}/history`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get problem event history:', error);
      throw error;
    }
  }

  // Host Groups management methods
  async getHostGroups(params = {}) {
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
      
      const endpoint = `/hostgroups${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get host groups:', error);
      throw error;
    }
  }

  // Templates management methods
  async getTemplates(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Handle array parameters
      if (params.templateids) {
        params.templateids.forEach(id => queryString.append('templateids', id));
      }
      if (params.groupids) {
        params.groupids.forEach(id => queryString.append('groupids', id));
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
      
      const endpoint = `/templates${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get templates:', error);
      throw error;
    }
  }

  // Events management methods
  async getEvents(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Handle array parameters
      if (params.eventids) {
        params.eventids.forEach(id => queryString.append('eventids', id));
      }
      if (params.objectids) {
        params.objectids.forEach(id => queryString.append('objectids', id));
      }
      if (params.source) {
        queryString.append('source', params.source);
      }
      if (params.object) {
        queryString.append('object', params.object);
      }
      
      // Handle simple parameters
      if (params.time_from) {
        queryString.append('time_from', params.time_from);
      }
      if (params.time_till) {
        queryString.append('time_till', params.time_till);
      }
      if (params.value !== undefined) {
        queryString.append('value', params.value);
      }
      if (params.limit) {
        queryString.append('limit', params.limit);
      }
      
      const endpoint = `/events${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get events:', error);
      throw error;
    }
  }

  // Comprehensive data methods
  async getAllData() {
    try {
      const response = await this.makeRequest('/all-data');
      return response;
    } catch (error) {
      console.error('Failed to get all Zabbix data:', error);
      throw error;
    }
  }

  async getDetailedHosts() {
    try {
      const response = await this.makeRequest('/hosts-detailed');
      return response;
    } catch (error) {
      console.error('Failed to get detailed hosts:', error);
      throw error;
    }
  }

  async getComprehensiveHostData(hostId) {
    try {
      const response = await this.makeRequest(`/hosts/${hostId}/comprehensive`);
      return response;
    } catch (error) {
      console.error(`Failed to get comprehensive data for host ${hostId}:`, error);
      throw error;
    }
  }

  // Hosts inventory methods
  async getHostsInventory(hostids = []) {
    try {
      let endpoint = '/hosts-inventory'
      if (hostids && hostids.length > 0) {
        const qs = new URLSearchParams()
        hostids.forEach(id => qs.append('hostids', id))
        endpoint += `?${qs.toString()}`
      }
      const response = await this.makeRequest(endpoint)
      return response
    } catch (error) {
      console.error('Failed to get hosts inventory:', error)
      throw error
    }
  }

  // Created-at timestamps (approx via oldest history)
  async getHostsCreatedAt(hostids = []) {
    try {
      let endpoint = '/hosts-created-at'
      if (hostids && hostids.length > 0) {
        const qs = new URLSearchParams()
        hostids.forEach(id => qs.append('hostids', id))
        endpoint += `?${qs.toString()}`
      }
      const response = await this.makeRequest(endpoint)
      return response
    } catch (error) {
      console.error('Failed to get hosts created-at:', error)
      throw error
    }
  }
  // SLA methods
  async getSlaHosts() {
    try {
      const response = await this.makeRequest('/sla/hosts')
      return response
    } catch (error) {
      console.error('Failed to get SLA hosts:', error)
      throw error
    }
  }

  // New: Calculate Actual/Target SLA from problems per host
  async getUptimeFromProblems(params = {}) {
    try {
      const qs = new URLSearchParams()
      if (params.hostids) {
        if (Array.isArray(params.hostids)) params.hostids.forEach(id => qs.append('hostids', id))
        else qs.append('hostids', params.hostids)
      }
      if (params.period_from) qs.append('period_from', params.period_from)
      if (params.period_to) qs.append('period_to', params.period_to)
      if (params.sla_target) qs.append('sla_target', params.sla_target)
      if (params.severity_filter) {
        if (Array.isArray(params.severity_filter)) qs.append('severity_filter', params.severity_filter.join(','))
        else qs.append('severity_filter', params.severity_filter)
      }
      const endpoint = `/sla/uptime-from-problems${qs.toString() ? `?${qs.toString()}` : ''}`
      const response = await this.makeRequest(endpoint)
      return response
    } catch (error) {
      console.error('Failed to get uptime from problems:', error)
      throw error
    }
  }

  async getLiveMetrics(itemids, limit = 5) {
    try {
      const queryString = new URLSearchParams();
      
      if (Array.isArray(itemids)) {
        itemids.forEach(id => queryString.append('itemids', id));
      } else {
        queryString.append('itemids', itemids);
      }
      
      if (limit) {
        queryString.append('limit', limit);
      }
      
      const endpoint = `/live-metrics?${queryString.toString()}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get live metrics:', error);
      throw error;
    }
  }

  async getHostLatestValues(hostId) {
    try {
      const response = await this.makeRequest(`/hosts/${hostId}/latest-values`);
      return response;
    } catch (error) {
      console.error(`Failed to get latest values for host ${hostId}:`, error);
      throw error;
    }
  }

  // Get ALL monitoring data for a host (items + history)
  async getHostMonitoringData(hostId, options = {}) {
    try {
      const queryString = new URLSearchParams();
      
      if (options.time_from) {
        queryString.append('time_from', options.time_from);
      }
      if (options.time_till) {
        queryString.append('time_till', options.time_till);
      }
      if (options.include_history !== undefined) {
        queryString.append('include_history', options.include_history);
      }

      const endpoint = `/hosts/${hostId}/monitoring-data${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error(`Failed to get monitoring data for host ${hostId}:`, error);
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