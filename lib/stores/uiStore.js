import { create } from 'zustand';

// Routes that should NOT have sidebar/topbar
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  // Treat /dashboard as public so layout (sidebar/topbar) is hidden
  '/dashboard'
];

export const useUIStore = create((set, get) => ({
  // Sidebar state
  sidebarOpen: true,
  isMobile: false,
  mobileSidebarOpen: false,

  // Sidebar search
  sidebarSearch: "",
  setSidebarSearch: (q) => set({ sidebarSearch: q }),

  // Set mobile state
  setIsMobile: (isMobile) => set({ isMobile }),

  // Toggle sidebar (desktop)
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Set sidebar open state
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Toggle mobile sidebar
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  // Set mobile sidebar open state
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  // Close mobile sidebar
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  // Check if a route is public
  isPublicRoute: (pathname) => PUBLIC_ROUTES.includes(pathname),

  // Check if layout should show sidebar/topbar
  shouldShowLayout: (pathname) => {
    return !PUBLIC_ROUTES.includes(pathname);
  }
}));

// Initialize mobile state on client side
// This will be called from ClientLayout using useEffect

