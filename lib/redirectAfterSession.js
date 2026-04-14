/**
 * Same post-auth routing as email/password sign-in: admin → overview, else workspace gate.
 */
export async function redirectAfterSession(router) {
  const { authService } = await import("@/lib/services/authService")
  const { workspaceService } = await import("@/lib/services/workspaceService")
  const { supabase } = await import("@/lib/supabase/client")

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) {
    router.push("/signin")
    return
  }

  let isAdmin = false
  try {
    isAdmin = await authService.isAdmin(token)
  } catch (error) {
    if (error?.name === "AbortError") {
      router.push("/observability/overview")
      return
    }
    console.error("Admin check failed:", error)
  }

  if (isAdmin) {
    router.push("/observability/overview")
    return
  }

  const workspaces = await workspaceService.getWorkspaces(token)
  if (!workspaces || workspaces.length === 0) {
    router.push("/workspace")
  } else {
    router.push("/observability/overview")
  }
}
