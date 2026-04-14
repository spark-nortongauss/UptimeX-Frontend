"use client"

import AuthLayout from "@/components/AuthLayout"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import { redirectAfterSession } from "@/lib/redirectAfterSession"

function getHashParams() {
  if (typeof window === "undefined") return {}
  const hash = window.location.hash?.startsWith("#")
    ? window.location.hash.slice(1)
    : ""
  const params = new URLSearchParams(hash)
  return {
    access_token: params.get("access_token") || undefined,
    refresh_token: params.get("refresh_token") || undefined,
    type: params.get("type") || undefined,
  }
}

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [accessToken, setAccessToken] = useState(undefined)
  const [refreshToken, setRefreshToken] = useState(undefined)
  const [parsed, setParsed] = useState(false)

  useEffect(() => {
    const { access_token, refresh_token } = getHashParams()
    setAccessToken(access_token)
    setRefreshToken(refresh_token)
    setParsed(true)
  }, [])

  const canSubmit = useMemo(() => {
    return (
      password.length >= 8 &&
      password === confirm &&
      Boolean(accessToken) &&
      Boolean(refreshToken)
    )
  }, [password, confirm, accessToken, refreshToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) {
      toast.error("Passwords must match and be at least 8 characters")
      return
    }
    setIsLoading(true)
    try {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (sessionError) throw sessionError

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })
      if (updateError) throw updateError

      toast.success("Your account is ready.")
      await redirectAfterSession(router)
    } catch (err) {
      const msg = err?.message || "Failed to set password"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (parsed && (!accessToken || !refreshToken)) {
    return (
      <AuthLayout
        title="Invalid or expired link"
        description="Open the invitation link from your email again, or sign in if you already set a password."
        linkText="Back to sign in"
        linkHref="/signin"
        linkLabel="Sign in"
        showSocial={false}
      >
        <Button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          onClick={() => router.push("/signin")}
        >
          Go to sign in
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set up your account"
      description="Choose a password to finish accepting your invitation"
      linkText="Back to sign in"
      linkHref="/signin"
      linkLabel="Sign in"
      showSocial={false}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="********"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="form-input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading || !canSubmit}
        >
          {isLoading ? "Saving…" : "Complete setup"}
        </Button>
      </form>
    </AuthLayout>
  )
}
