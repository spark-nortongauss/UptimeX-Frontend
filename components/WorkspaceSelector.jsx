"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { ChevronDown, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/lib/stores/authStore"

export default function WorkspaceSelector() {
  const { user } = useAuthStore()
  const displayName = useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "User"
    )
  }, [user])

  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const menuRef = useRef(null)

  // Mock workspaces data - replace with actual data from your store/API
  const workspaces = [
    { id: 1, name: "Default Workspace" },
    // Add more workspaces here as needed
  ]

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setSearchQuery("")
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  return (
    <div className="px-3 py-3 relative">
      {/* User and workspace display */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Default Workspace</p>
        </div>

        {/* Dropdown trigger */}
        <div ref={menuRef}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-700 dark:text-gray-200"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute top-full left-0 right-0 ml-2 mt-1 w-56 rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg z-[100]"
            >
              {/* Search bar */}
              <div className="p-2 border-b border-gray-200 dark:border-neutral-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Workspace list */}
              <div className="p-1 max-h-60 overflow-y-auto">
                {filteredWorkspaces.length > 0 ? (
                  filteredWorkspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      onClick={() => {
                        setMenuOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      {workspace.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No workspaces found
                  </div>
                )}
              </div>

              {/* Create Workspace button */}
              <div className="p-1 border-t border-gray-200 dark:border-neutral-800">
                <button
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  onClick={() => {
                    setMenuOpen(false)
                    setSearchQuery("")
                    setDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Workspace Name</Label>
              <Input id="ws-name" placeholder="Acme Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-plan">Subscription Plan</Label>
              <select
                id="ws-plan"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-neutral-900 dark:border-neutral-800 dark:text-gray-100"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a plan
                </option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}