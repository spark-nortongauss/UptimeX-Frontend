import { create } from 'zustand';

export const useTimeframeFilterStore = create((set) => ({
  // Default: last 24 hours
  dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dateTo: new Date().toISOString().split('T')[0],
  timeFrom: '00:00',
  timeTo: '23:59',

  // Actions
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  setTimeFrom: (time) => set({ timeFrom: time }),
  setTimeTo: (time) => set({ timeTo: time }),

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
    const state = useTimeframeFilterStore.getState();
    const fromDate = new Date(`${state.dateFrom}T${state.timeFrom}`);
    const toDate = new Date(`${state.dateTo}T${state.timeTo}`);
    
    return {
      time_from: Math.floor(fromDate.getTime() / 1000),
      time_till: Math.floor(toDate.getTime() / 1000),
    };
  },

  // Check if a timestamp (in seconds) is within the filter range
  isInRange: (timestamp) => {
    const { time_from, time_till } = useTimeframeFilterStore.getState().getTimeRange();
    return timestamp >= time_from && timestamp <= time_till;
  },

  // Check if a date/time string is within the filter range
  isDateTimeInRange: (dateTimeString) => {
    const state = useTimeframeFilterStore.getState();
    const fromDate = new Date(`${state.dateFrom}T${state.timeFrom}`);
    const toDate = new Date(`${state.dateTo}T${state.timeTo}`);
    const checkDate = new Date(dateTimeString);
    
    return checkDate >= fromDate && checkDate <= toDate;
  },
}));

