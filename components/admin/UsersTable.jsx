"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/authStore"
import { authService } from "@/lib/services/authService"
import { usersService } from "@/lib/services/usersService"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

export default function UsersTable() {
  const { getToken } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        const token = getToken() || await authService.getSessionToken()
        const data = await usersService.list(token)
        setUsers(data)
      } catch (e) {
        setError(e?.message || 'Error loading users')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [getToken])

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
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
  )
}