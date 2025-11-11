import { create } from 'zustand';

export const useTimeframeFilterStore = create((set, get) => ({
  // Default: last 24 hours
  dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dateTo: new Date().toISOString().split('T')[0],
  timeFrom: '00:00',
  timeTo: '23:59',
  
  // Recently used ranges (max 5)
  recentlyUsedRanges: [],

  // Actions
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  setTimeFrom: (time) => set({ timeFrom: time }),
  setTimeTo: (time) => set({ timeTo: time }),

  // Add range to recently used
  addRecentlyUsedRange: (range) => {
    const state = get();
    const newRange = {
      ...range,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    
    const updatedRanges = [
      newRange,
      ...state.recentlyUsedRanges.filter(r => 
        !(r.dateFrom === range.dateFrom && r.dateTo === range.dateTo && r.timeFrom === range.timeFrom && r.timeTo === range.timeTo)
      )
    ].slice(0, 5);
    
    set({ recentlyUsedRanges: updatedRanges });
  },

  // Apply quick range
  applyQuickRange: (range) => {
    const now = new Date();
    let dateFrom, dateTo, timeFrom, timeTo;
    
    switch (range) {
      case 'last5m':
        dateFrom = new Date(now.getTime() - 5 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = new Date(now.getTime() - 5 * 60 * 1000).toTimeString().slice(0, 5);
        timeTo = now.toTimeString().slice(0, 5);
        break;
      case 'last15m':
        dateFrom = new Date(now.getTime() - 15 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = new Date(now.getTime() - 15 * 60 * 1000).toTimeString().slice(0, 5);
        timeTo = now.toTimeString().slice(0, 5);
        break;
      case 'last30m':
        dateFrom = new Date(now.getTime() - 30 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = new Date(now.getTime() - 30 * 60 * 1000).toTimeString().slice(0, 5);
        timeTo = now.toTimeString().slice(0, 5);
        break;
      case 'last1h':
        dateFrom = new Date(now.getTime() - 60 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = new Date(now.getTime() - 60 * 60 * 1000).toTimeString().slice(0, 5);
        timeTo = now.toTimeString().slice(0, 5);
        break;
      case 'last3h':
        dateFrom = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = new Date(now.getTime() - 3 * 60 * 60 * 1000).toTimeString().slice(0, 5);
        timeTo = now.toTimeString().slice(0, 5);
        break;
      case 'last6h':
        dateFrom = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = new Date(now.getTime() - 6 * 60 * 60 * 1000).toTimeString().slice(0, 5);
        timeTo = now.toTimeString().slice(0, 5);
        break;
      case 'last12h':
        dateFrom = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = new Date(now.getTime() - 12 * 60 * 60 * 1000).toTimeString().slice(0, 5);
        timeTo = now.toTimeString().slice(0, 5);
        break;
      case 'last24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = '00:00';
        timeTo = '23:59';
        break;
      case 'last7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = '00:00';
        timeTo = '23:59';
        break;
      case 'last30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        timeFrom = '00:00';
        timeTo = '23:59';
        break;
      default:
        return;
    }
    
    set({ dateFrom, dateTo, timeFrom, timeTo });
  },

  // Reset to default (last 24 hours)
  reset: () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    set({
      dateFrom: yesterday.toISOString().split('T')[0],
      dateTo: now.toISOString().split('T')[0],
      timeFrom: '00:00',
      timeTo: '23:59',
    });
  },

  // Get filter as Unix timestamps (seconds)
  getTimeRange: () => {
    const state = get();
    const fromDate = new Date(`${state.dateFrom}T${state.timeFrom}`);
    const toDate = new Date(`${state.dateTo}T${state.timeTo}`);
    
    return {
      time_from: Math.floor(fromDate.getTime() / 1000),
      time_till: Math.floor(toDate.getTime() / 1000),
    };
  },

  // Check if a timestamp (in seconds) is within the filter range
  isInRange: (timestamp) => {
    const { time_from, time_till } = get().getTimeRange();
    return timestamp >= time_from && timestamp <= time_till;
  },

  // Check if a date/time string is within the filter range
  isDateTimeInRange: (dateTimeString) => {
    const state = get();
    const fromDate = new Date(`${state.dateFrom}T${state.timeFrom}`);
    const toDate = new Date(`${state.dateTo}T${state.timeTo}`);
    const checkDate = new Date(dateTimeString);
    
    return checkDate >= fromDate && checkDate <= toDate;
  },
}));

