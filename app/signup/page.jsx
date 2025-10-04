"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <Card className="w-full max-w-md border-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start monitoring with UptimeX in minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="yourname" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="********" required />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">Sign Up</Button>
          </form>

          <div className="mt-6 text-sm text-gray-600 flex items-center justify-between">
            <Link href="/signin" className="hover:underline">Already registered?</Link>
            <Link href="#" className="text-gray-500 hover:underline cursor-not-allowed" onClick={(e) => e.preventDefault()}>Forgot password?</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
