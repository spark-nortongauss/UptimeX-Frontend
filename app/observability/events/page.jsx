"use client"

import AuthGuard from "@/components/AuthGuard"
import EventsTable from "@/components/observability/EventsTable"
import EventsTimeframeFilter from "@/components/observability/EventsTimeframeFilter"

export default function ObservabilityEventsPage() {
  return (
    <AuthGuard>
      <div className="space-y-8">
        <EventsTimeframeFilter />
        <EventsTable />
      </div>
    </AuthGuard>
  )
}
