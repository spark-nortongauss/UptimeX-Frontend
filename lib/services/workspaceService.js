const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

class WorkspaceService {
  async getWorkspaces(token) {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workspaces');
    }

    const data = await response.json();
    return data.data;
  }

  async getAllWorkspaces(token) {
    const response = await fetch(`${API_BASE_URL}/workspaces/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all workspaces');
    }

    const data = await response.json();
    return data.data;
  }

  async createWorkspace(token, workspaceData) {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workspaceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create workspace');
    }

    const data = await response.json();
    return data.data;
  }

  async updateWorkspace(token, workspaceId, workspaceData) {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workspaceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update workspace');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteWorkspace(token, workspaceId) {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete workspace');
    }
  }

  async checkWorkspaceAccess(token, workspaceId) {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/check-access`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check workspace access');
    }

    const data = await response.json();
    return data.data;
  }
}

export const workspaceService = new WorkspaceService();