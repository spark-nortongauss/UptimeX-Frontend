/**
 * Marketing + auth surfaces stay on the default (light) palette regardless of in-app theme.
 */
export function isPublicLightOnlyPath(pathname) {
  if (!pathname) return false
  const path = pathname.split("?")[0] || ""
  if (path === "/") return true
  if (path === "/solutions" || path === "/signin" || path === "/forgot-password") {
    return true
  }
  if (path.startsWith("/auth/")) return true
  return false
}
