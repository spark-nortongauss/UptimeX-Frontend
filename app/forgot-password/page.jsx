"use client"

import AuthLayout from "@/components/AuthLayout"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { authService } from "@/lib/services/authService"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.requestPasswordReset(email)
      toast.success("Password reset email sent. Check your inbox.")
    } catch (err) {
      const msg = err?.message || "Failed to send password reset email"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email to receive a reset link"
      linkText="Remembered your password?"
      linkHref="/signin"
      linkLabel="Back to Sign in"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>

        <div className="text-center text-sm text-gray-600">
          <span>We’ll send a link to reset your password.</span>
        </div>

        <div className="text-center">
          <Link href="/signin" className="text-blue-600 hover:underline text-sm">
            Back to Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}