"use client"

import AdminGuard from "@/components/AdminGuard"
import WorkspacesTable from "@/components/admin/WorkspacesTable"

export default function AdminWorkspacesPage() {
  return (
    <AdminGuard>
      <div>
        <h1 className="text-xl font-semibold mb-4">Workspaces</h1>
        <WorkspacesTable />
      </div>
    </AdminGuard>
  )
}