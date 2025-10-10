import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  // Initialize auth state
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verify session with backend
        try {
          const backendUser = await authService.getUserProfile(session.access_token);
          set({ 
            user: session.user, 
            session, 
            loading: false, 
            initialized: true 
          });
        } catch (error) {
          console.error('Backend verification failed:', error);
          // If backend verification fails, still set the user from Supabase
          set({ 
            user: session.user, 
            session, 
            loading: false, 
            initialized: true 
          });
        }
      } else {
        set({ user: null, session: null, loading: false, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          set({ user: session.user, session });
        } else {
          set({ user: null, session: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, initialized: true });
    }
  },

  // Sign up with email and password
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    set({ user: data.user, session: data.session });
    return data;
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    console.log('Starting Google OAuth with redirect URL:', `${window.location.origin}/auth/callback`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        // Browser redirect আটকাই, আগে URL লগ করি
        skipBrowserRedirect: true,
      },
    });
  
    if (error) throw error;
  
    // Supabase যে অথরাইজ URL দিয়েছে – এতে client_id ও redirect_uri থাকবে
    console.log('OAuth authorize URL:', data?.url);
    if (data?.url) {
      window.location.href = data.url;
    }
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    set({ user: null, session: null });
  },

  // Reset password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
  },

  // Update password
  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  // Get current session token for API calls
  getToken: () => {
    const { session } = get();
    return session?.access_token || null;
  }
}))