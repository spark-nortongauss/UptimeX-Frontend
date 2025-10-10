"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AuthLayout from "@/components/AuthLayout"
import { useState } from "react"
import { useAuthStore } from "@/lib/stores/authStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await signIn(formData.email, formData.password)
      toast.success("Successfully signed in! Welcome back.")
      router.push("/dashboard")
    } catch (err) {
      const errorMessage = err.message || "Failed to sign in"
      setError(errorMessage)
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

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to UptimeX"
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Sign up"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
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
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
            Forgot password?
          </a>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthLayout>
  )
}
