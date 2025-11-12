import { create } from 'zustand';
import { zabbixService } from '../services/zabbixService';

// Severity mapping for Zabbix severity levels
// Everything except Major (3) and Critical (4, 5) is Minor with blue color
const SEVERITY_MAP = {
  0: { label: 'MINOR', color: 'bg-blue-500/90 text-white' },
  1: { label: 'MINOR', color: 'bg-blue-500/90 text-white' },
  2: { label: 'MINOR', color: 'bg-blue-500/90 text-white' },
  3: { label: 'MAJOR', color: 'bg-orange-500/90 text-white' },
  4: { label: 'CRITICAL', color: 'bg-red-500/90 text-white' },
  5: { label: 'CRITICAL', color: 'bg-red-700/90 text-white' }
};

// Status mapping for suppressed field
const STATUS_MAP = {
  0: { label: 'PROBLEM', color: 'text-red-500' },
  1: { label: 'SUPPRESSED', color: 'text-yellow-500' }
};

// Utility functions
const formatTimestamp = (timestamp) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const calculateAge = (timestamp) => {
  const now = Date.now();
  const eventTime = parseInt(timestamp) * 1000;
  const diffMs = now - eventTime;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
};

export const useZabbixStore = create((set, get) => ({
  // State
  problems: [],
  hosts: [],
  hostGroups: [],
  loading: false,
  error: null,
  lastFetch: null,
  
  // Cache settings
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Actions
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Transform enhanced problem data to alarm format
transformProblemToAlarm: (problem) => {
  // Convert severity to number and ensure it's valid
  // Zabbix API might return severity as string, so we need to parse it
  let severityValue = problem.severity;
  
  // Handle null, undefined, or empty string
  if (severityValue === null || severityValue === undefined || severityValue === '') {
    severityValue = 0;
  } else {
    // Convert to number (handles both string and number inputs)
    severityValue = parseInt(severityValue, 10);
    
    // If parsing failed or value is out of range, default to 0
    if (isNaN(severityValue) || severityValue < 0 || severityValue > 5) {
      console.warn('Invalid severity value:', problem.severity, 'for problem:', problem.name);
      severityValue = 0;
    }
  }
  
  // Now safely get the severity mapping
  const severity = SEVERITY_MAP[severityValue];
  const status = STATUS_MAP[problem.suppressed] || STATUS_MAP[0];
  
  // Debug logging - remove after fixing
  console.log('Problem:', problem.name, '| Original severity:', problem.severity, '| Parsed:', severityValue, '| Mapped:', severity.label);
  
  return {
    id: problem.eventid,
    host: problem.host ? problem.host.name : 'Unknown Host',
    hostId: problem.host ? problem.host.hostid : null,
    group: problem.hostGroup ? problem.hostGroup.name : 'Unknown Group',
    groupId: problem.hostGroup ? problem.hostGroup.groupid : null,
    severity: severity.label,
    severityColor: severity.color,
    severityValue: severityValue, // Store the numeric value for debugging
    status: status.label,
    statusColor: status.color,
    problem: problem.name,
    age: calculateAge(problem.clock),
    time: formatTimestamp(problem.clock),
    timestamp: problem.clock ? Number(problem.clock) : null,
    acknowledged: problem.acknowledged === '1',
    opdata: problem.opdata,
    tags: problem.tags || [],
    urls: problem.urls || [],
    matchedBy: problem.matchedBy || 'none',
    // Additional host information if available
    hostDetails: problem.host ? {
      hostid: problem.host.hostid,
      name: problem.host.name,
      host: problem.host.host,
      interfaces: problem.host.interfaces || []
    } : null,
    // Additional host group information if available
    hostGroupDetails: problem.hostGroup ? {
      groupid: problem.hostGroup.groupid,
      name: problem.hostGroup.name
    } : null
  };
},
  
  // Fetch problems from API using enhanced endpoint
  fetchProblems: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading(true);
      clearError();
      
      // Use the enhanced problems endpoint that includes host and host group data
      const problemsResponse = await zabbixService.getProblemsWithHostData(params);
      
      if (problemsResponse.success) {
        const transformedProblems = problemsResponse.data.map(problem => 
          get().transformProblemToAlarm(problem)
        );
        
        set({ 
          problems: transformedProblems,
          lastFetch: Date.now(),
          metadata: problemsResponse.metadata || null
        });
      } else {
        throw new Error(problemsResponse.message || 'Failed to fetch problems');
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      setError(error.message || 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  },
  
  // Fetch hosts
  fetchHosts: async () => {
    try {
      const response = await zabbixService.getHosts();
      if (response.success) {
        set({ hosts: response.data });
        return response;
      }
      throw new Error(response.message || 'Failed to fetch hosts');
    } catch (error) {
      console.error('Failed to fetch hosts:', error);
      return { success: false, data: [] };
    }
  },
  
  // Fetch host groups
  fetchHostGroups: async () => {
    try {
      const response = await zabbixService.getHostGroups();
      if (response.success) {
        set({ hostGroups: response.data });
        return response;
      }
      throw new Error(response.message || 'Failed to fetch host groups');
    } catch (error) {
      console.error('Failed to fetch host groups:', error);
      return { success: false, data: [] };
    }
  },
  
  // Refresh data if cache is stale
  refreshIfStale: async (params = {}) => {
    const { lastFetch, cacheTimeout, fetchProblems } = get();
    
    if (!lastFetch || Date.now() - lastFetch > cacheTimeout) {
      await fetchProblems(params);
    }
  },
  
  // Force refresh (ignore cache)
  forceRefresh: async (params = {}) => {
    await get().fetchProblems(params);
  },
  
  // Get filtered problems
  getFilteredProblems: (filters = {}) => {
    const { problems } = get();
    
    return problems.filter(problem => {
      if (filters.severity && problem.severity !== filters.severity) return false;
      if (filters.status && problem.status !== filters.status) return false;
      if (filters.host && !problem.host.toLowerCase().includes(filters.host.toLowerCase())) return false;
      if (filters.group && !problem.group.toLowerCase().includes(filters.group.toLowerCase())) return false;
      if (filters.acknowledged !== undefined && problem.acknowledged !== filters.acknowledged) return false;
      
      return true;
    });
  },
  
  // Get problems by severity
  getProblemsBySeverity: () => {
    const { problems } = get();
    
    return problems.reduce((acc, problem) => {
      if (!acc[problem.severity]) {
        acc[problem.severity] = [];
      }
      acc[problem.severity].push(problem);
      return acc;
    }, {});
  },
  
  // Get problems by host
  getProblemsByHost: () => {
    const { problems } = get();
    
    return problems.reduce((acc, problem) => {
      if (!acc[problem.host]) {
        acc[problem.host] = [];
      }
      acc[problem.host].push(problem);
      return acc;
    }, {});
  },
  
  // Get statistics
  getStatistics: () => {
    const { problems } = get();
    
    return {
      total: problems.length,
      bySeverity: problems.reduce((acc, problem) => {
        acc[problem.severity] = (acc[problem.severity] || 0) + 1;
        return acc;
      }, {}),
      byStatus: problems.reduce((acc, problem) => {
        acc[problem.status] = (acc[problem.status] || 0) + 1;
        return acc;
      }, {}),
      acknowledged: problems.filter(p => p.acknowledged).length,
      unacknowledged: problems.filter(p => !p.acknowledged).length
    };
  },
  
  // Initialize store
  initialize: async (params = {}) => {
    const { refreshIfStale } = get();
    await refreshIfStale(params);
  }
}));

// Auto-refresh every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { refreshIfStale } = useZabbixStore.getState();
    refreshIfStale();
  }, 5 * 60 * 1000);
}
