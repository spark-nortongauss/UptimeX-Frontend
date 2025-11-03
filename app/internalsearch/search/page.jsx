import { Suspense } from 'react'
import AuthGuard from '@/components/AuthGuard'
import SearchResultsClient from './searchResultsClient'
import { Search } from 'lucide-react'

// Site pages index - all pages available for search
// This is a frontend-only list of all searchable pages
export const sitePages = [
  // Observability Section
  { title: "Overview", url: "/observability/overview", category: "Observability", description: "View observability overview dashboard" },
  { title: "Detailed", url: "/observability/detailed", category: "Observability", description: "View detailed system information and metrics" },
  { title: "Topology Map", url: "/observability/topology", category: "Observability", description: "View network topology and system relationships" },
  { title: "Events", url: "/observability/events", category: "Observability", description: "View and manage system events" },
  { title: "Incidents", url: "/observability/incidents", category: "Observability", description: "View and manage incidents" },
  { title: "Problems", url: "/observability/problems", category: "Observability", description: "View and manage system problems" },
  { title: "Services", url: "/observability/services", category: "Observability", description: "View and manage services" },
  { title: "Reports", url: "/observability/reports", category: "Observability", description: "View observability reports" },
  
  // Support Section
  { title: "Tickets", url: "/support/tickets", category: "Support", description: "View and manage support tickets" },
  { title: "Major Incidents", url: "/support/major-incidents", category: "Support", description: "View and manage major incidents" },
  { title: "Problems", url: "/support/problems", category: "Support", description: "View support-related problems" },
  { title: "Reports", url: "/support/reports", category: "Support", description: "View support reports" },
  
  // Inventory Section
  { title: "Assets", url: "/inventory/assets", category: "Inventory", description: "View and manage inventory assets" },
  { title: "New Provisioning", url: "/inventory/provisioning", category: "Inventory", description: "Create and manage new provisioning" },
  { title: "Racks", url: "/inventory/racks", category: "Inventory", description: "View and manage racks" },
  { title: "Facilities", url: "/inventory/facilities", category: "Inventory", description: "View and manage facilities" },
  
  // Settings
  { title: "Settings", url: "/settings", category: "Settings", description: "Manage application settings" },
  
  // Other pages
  { title: "Alerts", url: "/alerts", category: "General", description: "View alerts and notifications" },
  { title: "Help", url: "/help", category: "General", description: "Get help and documentation" },
]

export const dynamic = 'force-dynamic'

export default function SearchResultsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">Loading search…</div>}>
        <SearchResultsClient />
      </Suspense>
    </AuthGuard>
  )
}
