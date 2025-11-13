"use client"

import { useParams, useRouter } from "next/navigation"
import AuthGuard from "@/components/AuthGuard"
import ProblemEventDetail from "@/components/observability/ProblemEventDetail"

export default function ProblemEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.eventId

  if (!eventId) {
    return (
      <AuthGuard>
        <div className="p-8">
          <p className="text-red-500">Event ID is required</p>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <ProblemEventDetail eventId={eventId} onBack={() => router.push("/observability/events")} />
    </AuthGuard>
  )
}

