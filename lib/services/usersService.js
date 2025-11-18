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
}