"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/authStore"
import { workspaceService } from "@/lib/services/workspaceService"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function WorkspacesTable() {
  const { getToken } = useAuthStore()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        const token = getToken()
        const ws = await workspaceService.getAllWorkspaces(token)
        setWorkspaces(ws || [])
      } catch (err) {
        setError("Failed to load workspaces")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [getToken])

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Workspaces</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total: {workspaces.length}</div>
        </div>
        <div className="overflow-x-auto">
          <Table className="bg-white dark:bg-neutral-900">
            <TableHeader className="bg-gray-50 dark:bg-neutral-900/60">
              <TableRow className="border-b border-gray-200 dark:border-neutral-800">
                <TableHead className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 py-4 px-6">
                  Workspace Name
                </TableHead>
                <TableHead className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 py-4 px-6">
                  Owner
                </TableHead>
                <TableHead className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 py-4 px-6">
                  Created At
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((w) => (
                <TableRow
                  key={w.id}
                  className="border-b border-gray-100 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors duration-150"
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {w.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {w.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                        {w.owner?.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {w.owner?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {w.owner?.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(w.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {workspaces.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">No workspaces found</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create your first workspace to get started</div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}