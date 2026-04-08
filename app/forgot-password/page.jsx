"use client"

import AuthLayout from "@/components/AuthLayout"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { authService } from "@/lib/services/authService"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined
    }
    const intervalId = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [resendCooldown])

  const canSubmitNewPassword = useMemo(() => {
    return newPassword.length >= 6 && newPassword === confirmPassword
  }, [newPassword, confirmPassword])

  const startResendCooldown = () => {
    setResendCooldown(60)
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Please enter your email")
      return
    }
    setIsLoading(true)
    try {
      await authService.requestPasswordReset(email)
      setStep(2)
      startResendCooldown()
      toast.success("Verification code sent! Please check your inbox for the code.")
    } catch (err) {
      const msg = err?.message || "Failed to send verification code"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const normalizedOtp = otp.replace(/\D/g, "").slice(0, 6)
    if (normalizedOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code")
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.verifyPasswordResetOtp(email, normalizedOtp)
      setResetToken(response.resetToken)
      setStep(3)
      toast.success("Code verified. You can now set a new password.")
    } catch (err) {
      const msg = err?.message || "Failed to verify code"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!canSubmitNewPassword) {
      toast.error("Passwords must match and be at least 6 characters")
      return
    }

    setIsLoading(true)
    try {
      await authService.resetPasswordWithOtp({
        email,
        resetToken,
        newPassword,
      })
      toast.success("Password updated successfully. Redirecting to sign in...")
      setTimeout(() => {
        router.push("/signin")
      }, 1500)
    } catch (err) {
      const msg = err?.message || "Failed to update password"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      description="Verify your email and set a new password"
      linkText="Remembered your password?"
      linkHref="/signin"
      linkLabel="Back to Sign in"
    >
      {step === 1 && (
        <form className="space-y-6" onSubmit={handleSendOtp}>
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
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending code...
              </span>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="form-input tracking-[0.3em]"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading || resendCooldown > 0}
            onClick={handleSendOtp}
          >
            {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
          </Button>
        </form>
      )}

      {step === 3 && (
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            disabled={isLoading || !canSubmitNewPassword}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      )}

      <div className="text-center mt-4">
        <Link href="/signin" className="text-blue-600 hover:underline text-sm">
          Back to Sign in
        </Link>
      </div>
    </AuthLayout>
  )
}