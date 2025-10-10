import { supabase } from '../supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authService = {
  // Verify token with backend
  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
  }
};