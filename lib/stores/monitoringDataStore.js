import { create } from 'zustand';
import { zabbixService } from '../services/zabbixService';

export const useMonitoringDataStore = create((set, get) => ({
  // State
  monitoringData: null,
  currentHostId: null,
  loading: false,
  error: null,
  lastFetch: null,
  cacheTimeout: 2 * 60 * 1000, // 2 minutes cache

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch monitoring data for a host
  fetchMonitoringData: async (hostId, options = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading(true);
      clearError();

      const response = await zabbixService.getHostMonitoringData(hostId, {
        time_from: options.time_from,
        time_till: options.time_till,
        include_history: options.include_history !== false, // Default to true
      });

      if (response.success && response.data) {
        set({
          monitoringData: response.data,
          currentHostId: hostId,
          lastFetch: Date.now(),
          error: null,
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch monitoring data');
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      setError(error.message || 'Failed to fetch monitoring data');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Get temperature items (BIU1, BIU2, BIU3)
  getTemperatureItems: () => {
    const { monitoringData } = get();
    if (!monitoringData || !monitoringData.items) {
      return [];
    }

    // Filter items that are temperature-related
    // Look for items with names/keys containing temperature indicators
    const temperatureItems = monitoringData.items.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const key = (item.key || '').toLowerCase();
      const units = (item.units || '').toLowerCase();
      
      // Check if it's a temperature item (has temp in name/key or °C units)
      const isTemperature = 
        name.includes('temp') || 
        name.includes('temperatura') ||
        key.includes('temp') ||
        units.includes('°c') ||
        units.includes('celsius');
      
      // Check if it's a BIU sensor (BIU1, BIU2, BIU3)
      // Match patterns like: "BIU1", "BIU 1", "BIU-1", "biu1", "sensor.temp.biu1"
      const isBIU = 
        /biu[-\s]?1/i.test(name) ||
        /biu[-\s]?2/i.test(name) ||
        /biu[-\s]?3/i.test(name) ||
        /biu[-\s]?1/i.test(key) ||
        /biu[-\s]?2/i.test(key) ||
        /biu[-\s]?3/i.test(key) ||
        key.includes('sensor.temp.biu1') ||
        key.includes('sensor.temp.biu2') ||
        key.includes('sensor.temp.biu3');
      
      // Also check for alarm items related to temperature (e.g., "BIU1 Alarme de Temperatura")
      const isTemperatureAlarm = 
        (name.includes('temperature') || name.includes('temperatura')) && 
        (name.includes('alarm') || name.includes('alarme')) &&
        (name.includes('biu') || key.includes('biu'));
      
      // Return if it's a temperature item AND (is BIU sensor OR is temperature alarm with BIU)
      return isTemperature && (isBIU || isTemperatureAlarm);
    });

    // Debug: Log found temperature items (only in development)
    // Removed console.log to reduce console noise

    return temperatureItems;
  },

  // Transform temperature data for chart
  getTemperatureChartData: () => {
    const { getTemperatureItems } = get();
    const temperatureItems = getTemperatureItems();

    if (temperatureItems.length === 0) {
      return [];
    }

    // Group history points by time (rounded to nearest minute for better grouping)
    const timeMap = new Map();

    temperatureItems.forEach((item) => {
      // Extract BIU number from name or key
      const name = (item.name || '').toLowerCase();
      const key = (item.key || '').toLowerCase();
      let biuNumber = null;

      // Try to extract BIU number from various patterns
      if (name.includes('biu1') || key.includes('biu1') || key.includes('.biu1')) {
        biuNumber = 'BIU1';
      } else if (name.includes('biu2') || key.includes('biu2') || key.includes('.biu2')) {
        biuNumber = 'BIU2';
      } else if (name.includes('biu3') || key.includes('biu3') || key.includes('.biu3')) {
        biuNumber = 'BIU3';
      } else {
        // Try to match patterns like "BIU 1", "BIU-1", etc.
        const biuMatch = name.match(/biu[-\s]?([123])/i) || key.match(/biu[-\s]?([123])/i);
        if (biuMatch) {
          biuNumber = `BIU${biuMatch[1]}`;
        }
      }

      if (!biuNumber) return;

      // Process history data
      if (item.history && Array.isArray(item.history) && item.history.length > 0) {
        item.history.forEach((point) => {
          const timestamp = point.clock;
          // Round to nearest minute for better grouping of simultaneous readings
          const date = new Date(timestamp * 1000);
          const roundedTimestamp = Math.floor(timestamp / 60) * 60; // Round to nearest minute
          const timeKey = roundedTimestamp.toString();

          if (!timeMap.has(timeKey)) {
            timeMap.set(timeKey, {
              time: date,
              timestamp: roundedTimestamp,
            });
          }

          const dataPoint = timeMap.get(timeKey);
          const value = parseFloat(point.value);
          if (!isNaN(value)) {
            // If multiple readings at same time, use average
            if (dataPoint[biuNumber] !== undefined) {
              dataPoint[biuNumber] = (dataPoint[biuNumber] + value) / 2;
            } else {
              dataPoint[biuNumber] = value;
            }
          }
        });
      }
    });

    // Convert map to array and sort by time
    let chartData = Array.from(timeMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((point) => {
        // Format time for display (HH:MM)
        const hours = point.time.getHours().toString().padStart(2, '0');
        const minutes = point.time.getMinutes().toString().padStart(2, '0');
        return {
          time: `${hours}:${minutes}`,
          timestamp: point.timestamp,
          BIU1: point.BIU1 !== undefined ? parseFloat(point.BIU1.toFixed(1)) : null,
          BIU2: point.BIU2 !== undefined ? parseFloat(point.BIU2.toFixed(1)) : null,
          BIU3: point.BIU3 !== undefined ? parseFloat(point.BIU3.toFixed(1)) : null,
        };
      });

    return chartData;
  },

  // Get aggregated temperature data (hourly averages for 24 hours)
  getAggregatedTemperatureData: () => {
    const { getTemperatureChartData } = get();
    const rawData = getTemperatureChartData();

    if (rawData.length === 0) {
      return [];
    }

    // Group by hour
    const hourlyMap = new Map();

    rawData.forEach((point) => {
      const date = new Date(point.timestamp * 1000);
      const hourKey = `${date.getHours()}:00`;
      const dateKey = date.toDateString();

      const key = `${dateKey}-${hourKey}`;

      if (!hourlyMap.has(key)) {
        hourlyMap.set(key, {
          time: hourKey,
          timestamp: point.timestamp,
          BIU1: [],
          BIU2: [],
          BIU3: [],
        });
      }

      const hourData = hourlyMap.get(key);
      if (point.BIU1 !== null) hourData.BIU1.push(point.BIU1);
      if (point.BIU2 !== null) hourData.BIU2.push(point.BIU2);
      if (point.BIU3 !== null) hourData.BIU3.push(point.BIU3);
    });

    // Calculate averages
    const aggregated = Array.from(hourlyMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((hour) => ({
        time: hour.time,
        timestamp: hour.timestamp,
        BIU1:
          hour.BIU1.length > 0
            ? parseFloat((hour.BIU1.reduce((a, b) => a + b, 0) / hour.BIU1.length).toFixed(1))
            : null,
        BIU2:
          hour.BIU2.length > 0
            ? parseFloat((hour.BIU2.reduce((a, b) => a + b, 0) / hour.BIU2.length).toFixed(1))
            : null,
        BIU3:
          hour.BIU3.length > 0
            ? parseFloat((hour.BIU3.reduce((a, b) => a + b, 0) / hour.BIU3.length).toFixed(1))
            : null,
      }));

    return aggregated;
  },

  // Refresh if cache is stale
  refreshIfStale: async (hostId, options = {}) => {
    const { lastFetch, cacheTimeout, currentHostId, fetchMonitoringData } = get();

    // Always fetch if hostId changed or cache is stale
    if (
      currentHostId !== hostId ||
      !lastFetch ||
      Date.now() - lastFetch > cacheTimeout
    ) {
      await fetchMonitoringData(hostId, options);
    }
  },

  // Force refresh (ignore cache)
  forceRefresh: async (hostId, options = {}) => {
    await get().fetchMonitoringData(hostId, options);
  },

  // Clear monitoring data
  clearMonitoringData: () => {
    set({
      monitoringData: null,
      currentHostId: null,
      lastFetch: null,
      error: null,
    });
  },
}));

