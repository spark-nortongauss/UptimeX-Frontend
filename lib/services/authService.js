import { apiRequest, unwrapResponse } from '../apiWrapper';
import { supabase } from '../supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// Small helper to avoid hanging requests in auth init flows
async function requestWithTimeout(resource, options = {}) {
  const { timeoutMs = 4000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await apiRequest(resource, { ...rest, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      // Timeout is expected, just rethrow
      throw error;
    }
    throw error;
  }
}

export const authService = {
  // Verify token with backend
  async verifyToken(token) {
    try {
      const response = await requestWithTimeout(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeoutMs: 4000,
      });

      return unwrapResponse(response, 'Token verification failed');
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  // Get user profile from backend
  async getUserProfile(token) {
    try {
      const response = await requestWithTimeout(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeoutMs: 4000,
      });

      return unwrapResponse(response, 'Failed to get user profile');
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Check admin access via backend guard
  async isAdmin(token) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/admin-only`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeoutMs: 4000,
      });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get current session token
  async getSessionToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  },

  // Request password reset email via backend
  async requestPasswordReset(email) {
    const response = await apiRequest(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return unwrapResponse(response, 'Failed to send reset email');
  },

  // Update password using recovery code or tokens via backend
  async updatePasswordWithCode({ code, access_token, password }) {
    const response = await apiRequest(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, access_token, new_password: password }),
    });
    return unwrapResponse(response, 'Failed to update password');
  },

};