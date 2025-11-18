"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/authStore"
import { authService } from "@/lib/services/authService"
import { usersService } from "@/lib/services/usersService"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase/client"

export default function UsersTable() {
  const { getToken } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [logs, setLogs] = useState([])
  const [newLogIndicator, setNewLogIndicator] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const token = getToken() || await authService.getSessionToken()
        const data = await usersService.list(token)
        setUsers(data)
        const logData = await usersService.listRoleLogs(token)
        setLogs(Array.isArray(logData) ? logData : [])
      } catch (e) {
        setError(e?.message || 'Error loading users')
      } finally {
        setLoading(false)
      }
    }
    run()

    // Set up realtime subscription for role change logs
    const subscription = supabase
      .channel('role-logs-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'role_change_logs'
        },
        async () => {
          try {
            const token = useAuthStore.getState().getToken() || await authService.getSessionToken()
            if (!token) return
            const latest = await usersService.listRoleLogs(token)
            setLogs(Array.isArray(latest) ? latest : [])
            setNewLogIndicator(true)
            setTimeout(() => setNewLogIndicator(false), 2000)
          } catch {}
        }
      )
      .subscribe()

    // Fallback polling in case realtime is unavailable
    const poll = setInterval(async () => {
      try {
        const token = useAuthStore.getState().getToken() || await authService.getSessionToken()
        if (!token) return
        const latest = await usersService.listRoleLogs(token)
        setLogs(Array.isArray(latest) ? latest : [])
      } catch {}
    }, 5000)

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
      clearInterval(poll)
    }
  }, [getToken])

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <>
    <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
      <CardContent className="p-0">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Registered Users</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total: {users.length}</div>
        </div>
        <Table className="bg-white dark:bg-neutral-900">
          <TableHeader className="bg-gray-50 dark:bg-neutral-900/60">
            <TableRow>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">ID</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Name</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Email</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Role</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Make Admin</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="hover:bg-gray-100 dark:hover:bg-neutral-800/50">
                <TableCell className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.id}</TableCell>
                <TableCell className="text-sm text-gray-700 dark:text-gray-300">{u.name}</TableCell>
                <TableCell className="text-sm text-gray-700 dark:text-gray-300">{u.email}</TableCell>
                <TableCell>
                  <span className={
                    u.role === 'ADMIN'
                      ? 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white'
                      : 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:text-gray-200'
                  }>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={u.role === 'ADMIN'}
                    disabled={updatingId === u.id}
                    onCheckedChange={async (checked) => {
                      const token = useAuthStore.getState().getToken() || await authService.getSessionToken()
                      if (!token) return
                      const nextRole = checked ? 'ADMIN' : 'USER'
                      setUpdatingId(u.id)
                      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: nextRole } : x))
                      try {
                        await usersService.updateRole(u.id, nextRole, token)
                        // Logs will update automatically via realtime subscription
                      } catch (e) {
                        setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: u.role } : x))
                        console.error(e)
                      } finally {
                        setUpdatingId(null)
                      }
                    }}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(u.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    
    <Card className="mt-6 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
      <CardContent className="p-0">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Role Change Logs</div>
            {newLogIndicator && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Latest {Math.min(50, logs.length)}</div>
        </div>
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-neutral-900/60">
            <TableRow>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Time</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Actor</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Action</TableHead>
              <TableHead className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id} className="hover:bg-gray-100 dark:hover:bg-neutral-800/50">
                <TableCell className="text-sm text-gray-700 dark:text-gray-300">{new Date(l.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-sm text-gray-700 dark:text-gray-300">{l.actor_name} ({l.actor_email})</TableCell>
                <TableCell>
                  <span className={
                    l.action === 'PROMOTE'
                      ? 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600 text-white'
                      : 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white'
                  }>
                    {l.action === 'PROMOTE' ? 'Made Admin' : 'Removed Admin'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-700 dark:text-gray-300">{l.target_name} ({l.target_email})</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">No logs</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  )
}