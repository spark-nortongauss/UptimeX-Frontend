import { apiRequest, unwrapResponse } from '../apiWrapper';
import { useAuthStore } from '../stores/authStore';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export const notificationsService = {
  async getNotifications() {
    try {
      const token = useAuthStore.getState().getToken() || await authService.getSessionToken();
      const response = await apiRequest(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return unwrapResponse(response, 'Failed to get notifications');
    } catch (error) {
      console.error('getNotifications error:', error);
      throw error;
    }
  },

  async markAsRead(id) {
    try {
      const token = useAuthStore.getState().getToken() || await authService.getSessionToken();
      const response = await apiRequest(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return unwrapResponse(response, 'Failed to mark notification as read');
    } catch (error) {
      console.error('mark notification as read error:', error);
      throw error;
    }
  },

  async deleteNotification(id) {
    try {
      const token = useAuthStore.getState().getToken() || await authService.getSessionToken();
      const response = await apiRequest(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return unwrapResponse(response, 'Failed to delete notification');
    } catch (error) {
      console.error('delete notification error:', error);
      throw error;
    }
  },

  async makeUserFromTrial(id, { firstName, lastName }) {
    try {
      const token = useAuthStore.getState().getToken() || await authService.getSessionToken();
      const response = await apiRequest(`${API_BASE_URL}/notifications/${id}/make-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName }),
      });
      return unwrapResponse(response, 'Failed to invite user');
    } catch (error) {
      console.error('makeUserFromTrial error:', error);
      throw error;
    }
  },
};
