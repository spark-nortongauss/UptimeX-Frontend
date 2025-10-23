"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AuthLayout from "@/components/AuthLayout"
import { useState } from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/authStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const { signIn, signInWithGoogle, signInWithLinkedIn, signInWithAzure } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn(formData.email, formData.password)
      toast.success("Successfully signed in! Welcome back.")
      router.push("/observability/overview")
    } catch (err) {
      const errorMessage = err.message || "Failed to sign in"
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
      const errorMessage = err.message || "Failed to sign in with Google"
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
      const errorMessage = err.message || "Failed to sign in with LinkedIn"
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
      const errorMessage = err.message || "Failed to sign in with Azure"
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }


  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to UptimeX"
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Sign up"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="you@example.com" 
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="********" 
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
            required 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input 
              id="remember" 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>

        {/* LinkedIn Sign In Button */}
        <Button 
          type="button"
          onClick={handleLinkedInSignIn}
          className="w-full bg-[#0077B5] hover:bg-[#006399] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          {isLoading ? "Signing in..." : "Continue with LinkedIn"}
        </Button>

        {/* Azure AD Sign In Button */}
        <Button 
          type="button"
          onClick={handleAzureSignIn}
          className="w-full bg-[#0078D4] hover:bg-[#106ebe] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.409 9.316a3.08 3.08 0 0 0-1.418.02 5.19 5.19 0 0 0-2.044 1.353 5.26 5.26 0 0 0-1.44 2.592 3.1 3.1 0 0 0-.15 1.44c.03.49.13.97.3 1.43.36.96.99 1.78 1.8 2.37.81.59 1.78.92 2.78.94.99.02 1.97-.27 2.79-.84.82-.57 1.42-1.4 1.69-2.36.13-.48.18-.98.15-1.48a3.34 3.34 0 0 0-.25-1.23 5.45 5.45 0 0 0-1.4-2.23 5.23 5.23 0 0 0-2.1-1.27 3.11 3.11 0 0 0-1.23-.2z"/>
            <path d="M22.46 12.25c0-.8-.07-1.6-.2-2.38a8.05 8.05 0 0 0-.6-2.12 7.3 7.3 0 0 0-1.1-1.87 7.01 7.01 0 0 0-1.54-1.5c-.6-.43-1.26-.79-1.96-1.07a8.21 8.21 0 0 0-2.19-.7 9.4 9.4 0 0 0-2.38-.1c-.83.1-1.64.3-2.42.6-.78.3-1.52.7-2.2 1.19a7.56 7.56 0 0 0-1.8 1.87 8.1 8.1 0 0 0-1.1 2.32 9.34 9.34 0 0 0-.4 2.5c-.03.84.06 1.68.27 2.49.21.81.53 1.59.96 2.3.43.71.96 1.36 1.58 1.92.62.56 1.33 1.02 2.1 1.37.77.35 1.6.59 2.45.71.85.12 1.71.13 2.56.03a9.5 9.5 0 0 0 2.4-.6c.78-.3 1.52-.7 2.2-1.19a7.56 7.56 0 0 0 1.8-1.87 8.1 8.1 0 0 0 1.1-2.32 9.34 9.34 0 0 0 .4-2.5z"/>
          </svg>
          {isLoading ? "Signing in..." : "Continue with Microsoft"}
        </Button>
      </form>
    </AuthLayout>
  )
}
