import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { authService } from '../services/authService';

let isInitializing = false;

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  isAdmin: false,

  // Initialize auth state
  // Determine admin status from a token
  _resolveAdmin: async (token) => {
    if (!token) return false;
    try {
      const result = await authService.verifyToken(token);
      return result?.user?.dbUser?.role === 'ADMIN';
    } catch {
      return false;
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Always set session immediately so UI can render.
        set({ user: session.user, session });

        // Backend verification + admin check in background.
        (async () => {
          try {
            await authService.getUserProfile(session.access_token);
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Backend verification failed (non-blocking):', error);
            }
          }
          // Resolve admin status
          const admin = await get()._resolveAdmin(session.access_token);
          set({ loading: false, initialized: true, isAdmin: admin });
        })();
      } else {
        set({ user: null, session: null, loading: false, initialized: true, isAdmin: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          set({ user: session.user, session });
          // Re-resolve admin on auth change (e.g. token refresh)
          const admin = await get()._resolveAdmin(session.access_token);
          set({ isAdmin: admin });
        } else {
          set({ user: null, session: null, isAdmin: false });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, initialized: true, isAdmin: false });
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Resolve admin status immediately so it's available when navigating
    const admin = await get()._resolveAdmin(data.session?.access_token);
    set({ user: data.user, session: data.session, isAdmin: admin });
    return data;
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;
    
    console.log('Starting Google OAuth with redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        // Browser redirect আটকাই, আগে URL লগ করি
        skipBrowserRedirect: true,
      },
    });
  
    if (error) throw error;
  
    // Supabase যে অথরাইজ URL দিয়েছে – এতে client_id ও redirect_uri থাকবে
    console.log('OAuth authorize URL:', data?.url);
    if (data?.url) {
      window.location.href = data.url;
    }
    return data;
  },

  // Sign in with LinkedIn OAuth
  signInWithLinkedIn: async () => {
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;
    
    console.log('Starting LinkedIn OAuth with redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: redirectUrl,
        scopes: 'openid profile email',
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.location.href = data.url;
    }
    return data;
  },

  // Sign in with Azure AD OAuth
  signInWithAzure: async () => {
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;
    
    console.log('Starting Azure AD OAuth with redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: redirectUrl,
        scopes: 'openid profile email',
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.location.href = data.url;
    }
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    set({ user: null, session: null, isAdmin: false });
  },


  // Get current session token for API calls
  getToken: () => {
    const { session } = get();
    return session?.access_token || null;
  }
}));

// Note: Auto-initialization removed to prevent hydration mismatch
// Initialize auth in ClientLayout using useEffect