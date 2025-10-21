import { supabase } from '../supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// Small helper to avoid hanging requests in auth init flows
async function fetchWithTimeout(resource, options = {}) {
  const { timeoutMs = 4000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, { ...rest, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export const authService = {
  // Verify token with backend
  async verifyToken(token) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeoutMs: 4000,
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  // Get user profile from backend
  async getUserProfile(token) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeoutMs: 4000,
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Get current session token
  async getSessionToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  },

  // Request password reset email via backend
  async requestPasswordReset(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || 'Failed to send reset email');
    }
    return await response.json();
  },

  // Update password using recovery code or tokens via backend
  async updatePasswordWithCode({ code, access_token, password }) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, access_token, new_password: password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || 'Failed to update password');
    }
    return await response.json();
  },

};