import { create } from 'zustand'

// Store to share system list and the selected system between pages
export const useSystemSelectionStore = create((set, get) => ({
  systemsById: {},
  selectedSystemId: null,

  setSystems: (systemsArray) => {
    if (!Array.isArray(systemsArray)) return
    const map = {}
    for (const sys of systemsArray) {
      if (!sys || !sys.id) continue
      map[sys.id] = sys
    }
    set({ systemsById: map })
  },

  selectSystem: (systemId, systemData) => {
    const current = get().systemsById
    const next = { ...current }
    if (systemId && systemData) {
      next[systemId] = { ...(current[systemId] || {}), ...systemData }
    }
    set({ selectedSystemId: systemId, systemsById: next })
  },

  getSelectedSystem: () => {
    const { selectedSystemId, systemsById } = get()
    if (!selectedSystemId) return null
    return systemsById[selectedSystemId] || null
  }
}))


