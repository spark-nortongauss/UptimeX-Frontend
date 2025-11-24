"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/authStore"
import { workspaceService } from "@/lib/services/workspaceService"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function WorkspacesTable() {
  const { getToken } = useAuthStore()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedWorkspaces, setSelectedWorkspaces] = useState(new Set())
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const loadWorkspaces = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const ws = await workspaceService.getAllWorkspaces(token)
      setWorkspaces(ws || [])
      setSelectedWorkspaces(new Set()) // Clear selection after reload
    } catch (err) {
      setError("Failed to load workspaces")
      toast.error("Failed to load workspaces")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkspaces()
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

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedWorkspaces(new Set(workspaces.map(w => w.id)))
    } else {
      setSelectedWorkspaces(new Set())
    }
  }

  // Handle individual checkbox
  const handleSelectWorkspace = (workspaceId, checked) => {
    const newSelected = new Set(selectedWorkspaces)
    if (checked) {
      newSelected.add(workspaceId)
    } else {
      newSelected.delete(workspaceId)
    }
    setSelectedWorkspaces(newSelected)
  }

  // Handle bulk delete - show confirmation dialog
  const handleBulkDelete = () => {
    if (selectedWorkspaces.size === 0) {
      toast.error("No workspaces selected")
      return
    }
    setShowDeleteDialog(true)
  }

  // Confirm and execute delete
  const confirmDelete = async () => {
    setShowDeleteDialog(false)
    setDeleting(true)
    try {
      const token = getToken()
      const workspaceIds = Array.from(selectedWorkspaces)
      const result = await workspaceService.bulkDeleteWorkspaces(token, workspaceIds)

      if (result.deleted.length > 0) {
        toast.success(`Successfully deleted ${result.deleted.length} workspace(s)`)
      }

      if (result.failed.length > 0) {
        toast.error(`Failed to delete ${result.failed.length} workspace(s)`)
        console.error("Failed deletions:", result.failed)
      }

      // Reload workspaces
      await loadWorkspaces()
    } catch (err) {
      console.error("Error deleting workspaces:", err)
      toast.error(err.message || "Failed to delete workspaces")
    } finally {
      setDeleting(false)
    }
  }

  const isAllSelected = workspaces.length > 0 && selectedWorkspaces.size === workspaces.length
  const isSomeSelected = selectedWorkspaces.size > 0 && selectedWorkspaces.size < workspaces.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <>
      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-0">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Workspaces</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total: {workspaces.length}</div>
            </div>
            <Button
              onClick={handleBulkDelete}
              disabled={deleting || selectedWorkspaces.size === 0}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedWorkspaces.size > 0 ? `(${selectedWorkspaces.size})` : ''}
                </>
              )}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table className="bg-white dark:bg-neutral-900">
              <TableHeader className="bg-gray-50 dark:bg-neutral-900/60">
                <TableRow className="border-b border-gray-200 dark:border-neutral-800">
                  <TableHead className="w-12 py-4 px-6">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all workspaces"
                      className={isSomeSelected ? "data-[state=checked]:bg-gray-400" : ""}
                    />
                  </TableHead>
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
                      <Checkbox
                        checked={selectedWorkspaces.has(w.id)}
                        onCheckedChange={(checked) => handleSelectWorkspace(w.id, checked)}
                        aria-label={`Select ${w.name}`}
                      />
                    </TableCell>
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
                    <TableCell colSpan={4} className="py-12 text-center">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <DialogTitle className="text-gray-900 dark:text-gray-100">Delete Workspaces</DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 dark:text-gray-400 pt-4">
              Are you sure you want to delete {selectedWorkspaces.size} workspace{selectedWorkspaces.size > 1 ? 's' : ''}?
              This action cannot be undone and will permanently remove {selectedWorkspaces.size > 1 ? 'these workspaces' : 'this workspace'} and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}