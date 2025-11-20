import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Routes that should NOT have sidebar/topbar
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  // Treat /dashboard as public so layout (sidebar/topbar) is hidden
  '/dashboard',
  '/workspace'
];

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      isMobile: false,
      mobileSidebarOpen: false,

      // Theme state - defaults will be set by persist middleware
      theme: 'light',
      isDark: false,
      _themeInitialized: false,

      // Set theme
      setTheme: (theme) => {
        const isDark = theme === 'dark';
        const currentTheme = get().theme;
        
        // Only update if theme actually changed
        if (currentTheme !== theme) {
          set({ theme, isDark });
        }
        
        // Apply theme to document immediately
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      // Toggle theme
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      // Initialize theme on mount (only once)
      initializeTheme: () => {
        if (get()._themeInitialized) {
          return; // Already initialized
        }
        
        const theme = get().theme;
        const isDark = theme === 'dark';
        
        // Mark as initialized first to prevent loops
        set({ _themeInitialized: true });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

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
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ theme: state.theme, isDark: state.isDark }),
    }
  )
);

// Initialize mobile state on client side
// This will be called from ClientLayout using useEffect

