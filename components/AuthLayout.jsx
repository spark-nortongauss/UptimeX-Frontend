"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

// Social Media Icons Component
const SocialIcon = ({ provider, onClick }) => {
  const icons = {
    google: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    microsoft: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z"/>
        <path fill="#7FBA00" d="M13 1h10v10H13z"/>
        <path fill="#00A4EF" d="M1 13h10v10H1z"/>
        <path fill="#FFB900" d="M13 13h10v10H13z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
    >
      {icons[provider]}
    </button>
  )
}

export default function AuthLayout({ 
  title, 
  description, 
  children, 
  linkText, 
  linkHref, 
  linkLabel,
  showSocial = true,
  showTerms = false 
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialLogin = (provider) => {
    setIsLoading(true)
    // Handle social login logic here
    console.log(`Login with ${provider}`)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Background and Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 md:gap-1.5 mb-3 mr-12">
              <img src="/assets/observone_icon_1080p.png" alt="ObservOne icon" className="h-12 md:h-16 lg:h-20 w-auto -mr-3 md:-mr-4 mt-3" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-none">ObservOne</h1>
            </div>
            <p className="text-xl text-gray-100 max-w-md">
              Unlock your project performance with advanced monitoring and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="text-center pb-8 bg-white">
              <CardTitle className="text-3xl font-bold text-gray-900">{title}</CardTitle>
              <CardDescription className="text-gray-600 text-lg">{description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 bg-white">
              {children}

              {showSocial && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <SocialIcon provider="microsoft" onClick={() => handleSocialLogin('microsoft')} />
                    <SocialIcon provider="google" onClick={() => handleSocialLogin('google')} />
                    <SocialIcon provider="linkedin" onClick={() => handleSocialLogin('linkedin')} />
                  </div>
                </>
              )}

              <div className="text-center">
                <span className="text-gray-600">{linkText}</span>
                <Link href={linkHref} className="ml-2 font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  {linkLabel}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}