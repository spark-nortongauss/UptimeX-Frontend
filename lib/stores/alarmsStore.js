import { create } from 'zustand';
import { alarmsService } from '../services/alarmsService';
import { createClient } from '@supabase/supabase-js';

// Severity mapping for Zabbix severity levels
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

// Initialize Supabase client for real-time subscriptions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient = null;
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export const useAlarmsStore = create((set, get) => ({
  // State
  problems: [],
  loading: false,
  error: null,
  lastFetch: null,
  statistics: null,
  subscription: null,
  isRealTimeEnabled: true,
  
  // Cache settings
  cacheTimeout: 2 * 60 * 1000, // 2 minutes (fallback for when real-time is disabled)
  
  // Actions
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Real-time subscription management
  setupRealtimeSubscription: () => {
    if (!supabaseClient || !get().isRealTimeEnabled) {
      console.log('Real-time disabled or client not available');
      return;
    }

    console.log('Setting up real-time subscription for active alarms...');

    // Clean up existing subscription
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
    }

    // Set up new subscription
    const newSubscription = supabaseClient
      .channel('active_alarms_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'active_alarms',
        },
        (payload) => {
          console.log('Real-time change detected:', payload.eventType, payload.new);
          
          const { problems } = get();
          let updatedProblems = [...problems];

          switch (payload.eventType) {
            case 'INSERT':
              // Add new alarm
              const newAlarm = get().transformSupabaseAlarm(payload.new);
              updatedProblems = [newAlarm, ...updatedProblems];
              break;
            
            case 'UPDATE':
              // Update existing alarm
              const updatedAlarm = get().transformSupabaseAlarm(payload.new);
              updatedProblems = updatedProblems.map(alarm => 
                alarm.id === updatedAlarm.id ? updatedAlarm : alarm
              );
              break;
            
            case 'DELETE':
              // Remove alarm
              updatedProblems = updatedProblems.filter(alarm => alarm.id !== payload.old.eventid);
              break;
          }

          // Update state and statistics
          set({ problems: updatedProblems });
          get().fetchStatistics(); // Refresh statistics
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    set({ subscription: newSubscription });
    console.log('Real-time subscription established');
  },
  
  // Disable real-time and fall back to polling
  disableRealtime: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null, isRealTimeEnabled: false });
      console.log('Real-time disabled, falling back to polling');
    }
  },
  
  // Enable real-time
  enableRealtime: () => {
    set({ isRealTimeEnabled: true });
    get().setupRealtimeSubscription();
  },
  
  // Cleanup subscription
  cleanup: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
      console.log('Real-time subscription cleaned up');
    }
  },
  
  // Transform Supabase alarm data to match frontend format
  transformSupabaseAlarm: (alarm) => {
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
      matchedBy: alarm.matched_by || 'none',
    };
  },
  
  // Fetch problems from Supabase
  fetchProblems: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading(true);
      clearError();
      
      console.log('Fetching alarms from Supabase with params:', params);
      
      // Use the new alarms service
      const response = await alarmsService.getActiveAlarms({
        limit: params.limit || 100,
        ...params
      });
      
      console.log('Alarms response:', {
        success: response.success,
        count: response.count,
        dataLength: response.data?.length || 0
      });
      
      if (response.success) {
        const transformedProblems = response.data.map(alarm => 
          get().transformSupabaseAlarm(alarm)
        );
        
        console.log(`Transformed ${transformedProblems.length} alarms`);
        
        set({ 
          problems: transformedProblems,
          lastFetch: Date.now(),
        });
      } else {
        throw new Error(response.message || 'Failed to fetch alarms');
      }
    } catch (error) {
      console.error('Failed to fetch alarms from Supabase:', error);
      setError(error.message || 'Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  },
  
  // Fetch alarm statistics
  fetchStatistics: async () => {
    try {
      const response = await alarmsService.getStatistics();
      
      if (response.success) {
        set({ statistics: response.data });
      } else {
        throw new Error(response.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Failed to fetch alarm statistics:', error);
    }
  },
  
  // Trigger manual sync
  triggerSync: async () => {
    try {
      const response = await alarmsService.triggerSync();
      
      if (response.success) {
        console.log('Alarm sync triggered successfully');
        // Refresh data after triggering sync
        await get().fetchProblems();
        await get().fetchStatistics();
      } else {
        throw new Error(response.message || 'Failed to trigger sync');
      }
    } catch (error) {
      console.error('Failed to trigger alarm sync:', error);
    }
  },
  
  // Acknowledge alarm
  acknowledgeAlarm: async (eventId) => {
    try {
      const response = await alarmsService.acknowledgeAlarm(eventId);
      
      if (response.success) {
        console.log(`Alarm ${eventId} acknowledged successfully`);
        // Refresh the problems list
        await get().fetchProblems();
      } else {
        throw new Error(response.message || 'Failed to acknowledge alarm');
      }
    } catch (error) {
      console.error(`Failed to acknowledge alarm ${eventId}:`, error);
    }
  },
  
  // Refresh data if cache is stale
  refreshIfStale: async (params = {}) => {
    const { lastFetch, cacheTimeout, fetchProblems } = get();
    
    if (!lastFetch || Date.now() - lastFetch > cacheTimeout) {
      await fetchProblems(params);
      await get().fetchStatistics();
    }
  },
  
  // Force refresh (ignore cache)
  forceRefresh: async (params = {}) => {
    await get().fetchProblems(params);
    await get().fetchStatistics();
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
    const { problems, statistics } = get();
    
    // If we have cached statistics from Supabase, use them
    if (statistics) {
      return {
        total: statistics.total,
        bySeverity: statistics.by_severity,
        byStatus: statistics.by_status,
        acknowledged: statistics.acknowledged,
        unacknowledged: statistics.unacknowledged,
        lastUpdated: statistics.last_updated,
      };
    }
    
    // Fallback to local calculation
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
      unacknowledged: problems.filter(p => !p.acknowledged).length,
    };
  },
  
  // Initialize store
  initialize: async (params = {}) => {
    const { refreshIfStale, setupRealtimeSubscription } = get();
    
    // Set up real-time subscription
    setupRealtimeSubscription();
    
    // Initial data fetch
    await refreshIfStale(params);
  }
}));

// Auto-refresh every 2 minutes (shorter interval for real-time data)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { refreshIfStale } = useAlarmsStore.getState();
    refreshIfStale();
  }, 2 * 60 * 1000);
}