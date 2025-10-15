"use client"

import AuthLayout from "@/components/AuthLayout"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { authService } from "@/lib/services/authService"

function getHashParams() {
  if (typeof window === 'undefined') return {}
  const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : ''
  const params = new URLSearchParams(hash)
  const access_token = params.get('access_token') || undefined
  const refresh_token = params.get('refresh_token') || undefined
  return { access_token, refresh_token }
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [code, setCode] = useState(undefined)
  const [accessToken, setAccessToken] = useState(undefined)

  useEffect(() => {
    // Parse code from query string
    const url = new URL(window.location.href)
    const codeParam = url.searchParams.get('code') || undefined
    const { access_token } = getHashParams()
    setCode(codeParam || undefined)
    setAccessToken(access_token || undefined)
  }, [])

  const canSubmit = useMemo(() => {
    return password.length >= 8 && password === confirm
  }, [password, confirm])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) {
      toast.error("Passwords must match and be at least 8 characters")
      return
    }
    setIsLoading(true)
    try {
      await authService.updatePasswordWithCode({
        code,
        access_token: accessToken,
        password,
      })
      toast.success("Your password has been updated. Please sign in.")
      // Redirect to sign in
      window.location.href = "/signin"
    } catch (err) {
      const msg = err?.message || "Failed to update password"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      description="Enter a new password to complete the reset"
      linkText="Back to sign in"
      linkHref="/signin"
      linkLabel="Sign in"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="********"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading || !canSubmit}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthLayout>
  )
}