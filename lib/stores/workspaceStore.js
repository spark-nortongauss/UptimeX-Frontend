import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Workspace store for managing workspace state
export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // State
      workspaces: [],
      currentWorkspace: null,
      loading: false,
      error: null,

      // Actions
      setWorkspaces: (workspaces) => set({ workspaces }),
      
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      // Check if user has any workspaces
      hasWorkspaces: () => {
        const { workspaces } = get();
        return workspaces && workspaces.length > 0;
      },

      // Get workspace by ID
      getWorkspaceById: (workspaceId) => {
        const { workspaces } = get();
        return workspaces.find(w => w.id === workspaceId);
      },

      // Add workspace to list
      addWorkspace: (workspace) => {
        const { workspaces } = get();
        set({ workspaces: [...workspaces, workspace] });
      },

      // Update workspace in list
      updateWorkspace: (workspaceId, updates) => {
        const { workspaces } = get();
        const updatedWorkspaces = workspaces.map(workspace =>
          workspace.id === workspaceId ? { ...workspace, ...updates } : workspace
        );
        set({ workspaces: updatedWorkspaces });
        
        // Update current workspace if it's the one being updated
        const { currentWorkspace } = get();
        if (currentWorkspace && currentWorkspace.id === workspaceId) {
          set({ currentWorkspace: { ...currentWorkspace, ...updates } });
        }
      },

      // Remove workspace from list
      removeWorkspace: (workspaceId) => {
        const { workspaces, currentWorkspace } = get();
        const filteredWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        set({ workspaces: filteredWorkspaces });
        
        // Clear current workspace if it was removed
        if (currentWorkspace && currentWorkspace.id === workspaceId) {
          set({ currentWorkspace: null });
        }
      },

      // Clear all workspace data
      clearWorkspaces: () => {
        set({ 
          workspaces: [], 
          currentWorkspace: null, 
          error: null 
        });
      },

      // Set current workspace by ID
      setCurrentWorkspaceById: (workspaceId) => {
        const workspace = get().getWorkspaceById(workspaceId);
        if (workspace) {
          set({ currentWorkspace: workspace });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        workspaces: state.workspaces,
      }),
    }
  )
);