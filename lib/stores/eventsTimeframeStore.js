"use client"

import { create } from "zustand"

const toDateString = (date) => date.toISOString().split("T")[0]
const toTimeString = (date) => date.toTimeString().slice(0, 5)

const buildRange = (durationMs) => {
  const now = new Date()
  const from = new Date(now.getTime() - durationMs)
  return {
    dateFrom: toDateString(from),
    timeFrom: toTimeString(from),
    dateTo: toDateString(now),
    timeTo: toTimeString(now),
  }
}

export const useEventsTimeframeStore = create((set, get) => ({
  mode: "all", // 'all' | 'range'
  dateFrom: null,
  timeFrom: null,
  dateTo: null,
  timeTo: null,
  recentlyUsedRanges: [],

  setAllTime: () =>
    set({
      mode: "all",
      dateFrom: null,
      timeFrom: null,
      dateTo: null,
      timeTo: null,
    }),

  setAbsoluteRange: ({ dateFrom, timeFrom, dateTo, timeTo }) => {
    const range = { dateFrom, timeFrom, dateTo, timeTo }
    set((state) => ({
      mode: "range",
      ...range,
      recentlyUsedRanges: [
        {
          id: Date.now().toString(),
          ...range,
        },
        ...state.recentlyUsedRanges.filter(
          (r) =>
            !(
              r.dateFrom === range.dateFrom &&
              r.timeFrom === range.timeFrom &&
              r.dateTo === range.dateTo &&
              r.timeTo === range.timeTo
            )
        ),
      ].slice(0, 5),
    }))
  },

  applyQuickRange: (durationMs) => {
    const range = buildRange(durationMs)
    get().setAbsoluteRange(range)
    return range
  },

  getRangeInfo: () => {
    const state = get()
    if (
      state.mode !== "range" ||
      !state.dateFrom ||
      !state.timeFrom ||
      !state.dateTo ||
      !state.timeTo
    ) {
      return { mode: "all" }
    }
    const fromDate = new Date(`${state.dateFrom}T${state.timeFrom}`)
    const toDate = new Date(`${state.dateTo}T${state.timeTo}`)
    return {
      mode: "range",
      time_from: Math.floor(fromDate.getTime() / 1000),
      time_till: Math.floor(toDate.getTime() / 1000),
      label: `${state.dateFrom} ${state.timeFrom} → ${state.dateTo} ${state.timeTo}`,
    }
  },
}))

