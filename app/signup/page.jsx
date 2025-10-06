"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AuthLayout from "@/components/AuthLayout"
import { useState } from "react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Handle sign up logic here
    console.log("Sign up:", formData)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <AuthLayout
      title="Sign up"
      description="Create an account to start using UptimeX"
      linkText="Already registered?"
      linkHref="/signin"
      linkLabel="Sign in"
      showTerms={true}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            name="name" 
            type="text" 
            placeholder="John Doe" 
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            required 
          />
        </div>
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

        <div className="flex items-start space-x-2">
          <input 
            id="terms" 
            type="checkbox" 
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <Label htmlFor="terms" className="text-sm text-gray-600">
            You Accept Our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
              Terms And Conditions
            </a>{" "}
            And{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading || !acceptTerms}
        >
          {isLoading ? "Creating Account..." : "Create An Account"}
        </Button>
      </form>
    </AuthLayout>
  )
}
