"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import AuthLayout from "@/components/AuthLayout"
import { useState } from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/authStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function SignInPage() {
  const t = useTranslations('Auth.signin')
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const { signIn, signInWithGoogle, signInWithLinkedIn, signInWithAzure } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn(formData.email, formData.password)
      toast.success(t('toastSuccess'))

      // Check if user is admin or has workspaces before redirecting
      const token = result.session?.access_token
      if (token) {
        const { authService } = await import('@/lib/services/authService')
        const { workspaceService } = await import('@/lib/services/workspaceService')

        // Check if user is admin
        let isAdmin = false;
        try {
          isAdmin = await authService.isAdmin(token)
        } catch (error) {
          // If admin check times out, default to admin flow (safer than treating admin as regular user)
          if (error.name === 'AbortError') {
            console.warn('Admin verification timed out during signin - defaulting to admin flow');
            router.push('/observability/overview');
            return;
          }
          // For other errors, continue with workspace check
          console.error('Admin check failed:', error);
        }

        if (isAdmin) {
          // Admin users go to observability overview
          router.push('/observability/overview')
          return
        }

        // Check if user has workspaces
        const workspaces = await workspaceService.getWorkspaces(token)

        if (!workspaces || workspaces.length === 0) {
          // No workspaces, redirect to workspace creation
          router.push('/workspace')
        } else {
          // Has workspaces, go to overview
          router.push('/observability/overview')
        }
      } else {
        router.push('/observability/overview')
      }
    } catch (err) {
      const errorMessage = err.message || t('toastFail')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      await signInWithGoogle()
      // The redirect will be handled by the OAuth flow
    } catch (err) {
      const errorMessage = err.message || t('toastGoogleFail')
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  const handleLinkedInSignIn = async () => {
    setIsLoading(true)

    try {
      await signInWithLinkedIn()
      // The redirect will be handled by the OAuth flow
    } catch (err) {
      const errorMessage = err.message || t('toastLinkedInFail')
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  const handleAzureSignIn = async () => {
    setIsLoading(true)

    try {
      await signInWithAzure()
      // The redirect will be handled by the OAuth flow
    } catch (err) {
      const errorMessage = err.message || t('toastAzureFail')
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }


  return (
    <AuthLayout
      title={t('title')}
      description={t('description')}
      socialLoading={isLoading}
      socialHandlers={{
        google: handleGoogleSignIn,
        linkedin: handleLinkedInSignIn,
        microsoft: handleAzureSignIn,
      }}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="!text-gray-700 font-medium">{t('email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            className="!bg-white !border-gray-300 !text-gray-900 placeholder:!text-gray-400 focus:!border-[#3e6e70] focus:!ring-[#3e6e70] [&:-webkit-autofill]:!bg-white [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827!important]"
            style={{ backgroundColor: 'white !important', color: '#111827 !important' }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="!text-gray-700 font-medium">{t('password')}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.password}
              onChange={handleInputChange}
              className="!bg-white !border-gray-300 !text-gray-900 placeholder:!text-gray-400 focus:!border-[#3e6e70] focus:!ring-[#3e6e70] [&:-webkit-autofill]:!bg-white [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827!important] pr-10"
              style={{ backgroundColor: 'white !important', color: '#111827 !important' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="rounded border-gray-300 text-[#2d4344] focus:ring-[#3e6e70] bg-white"
            />
            <Label htmlFor="remember" className="text-sm text-gray-600 font-normal">
              {t('remember')}
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm font-medium hover:underline transition-colors" style={{ color: "#3e6e70" }}>
            {t('forgot')}
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full text-white font-semibold py-3 rounded-lg transition-all duration-200 select-none shadow-md hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#2d4344" }}
          disabled={isLoading}
        >
          {isLoading ? t('submitting') : t('submit')}
        </Button>

      </form>
    </AuthLayout>
  )
}