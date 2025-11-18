"use client"

import AdminGuard from "@/components/AdminGuard"
import UsersTable from "@/components/admin/UsersTable"

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>
        <h1 className="text-xl font-semibold mb-4">Users</h1>
        <UsersTable />
      </div>
    </AdminGuard>
  )
}