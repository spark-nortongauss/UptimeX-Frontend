const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export const usersService = {
  async list(token) {
    const resp = await fetch(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!resp.ok) {
      const msg = await resp.text().catch(() => '')
      throw new Error(msg || 'Failed to fetch users')
    }
    const data = await resp.json()
    return Array.isArray(data) ? data : (data?.users || [])
  }
  ,
  async updateRole(id, role, token) {
    const resp = await fetch(`${API_BASE_URL}/users/${id}/role`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role })
    })
    if (!resp.ok) {
      const msg = await resp.text().catch(() => '')
      throw new Error(msg || 'Failed to update role')
    }
    return await resp.json()
  }
  ,
  async listRoleLogs(token) {
    const resp = await fetch(`${API_BASE_URL}/users/role-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!resp.ok) {
      const msg = await resp.text().catch(() => '')
      throw new Error(msg || 'Failed to fetch role logs')
    }
    return await resp.json()
  }
}