"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Cpu, Activity, User, Settings, Monitor, LogOut } from "lucide-react"
import { useAuthStore } from "@/lib/stores/authStore"
import { toast } from "sonner"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/metrics", label: "Metrics", icon: Activity },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuthStore()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Successfully logged out")
      router.push('/signin')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error("Failed to logout")
    }
  }

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 border-r border-gray-200/80 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-screen sticky top-0 flex-col gap-4 p-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">UptimeX</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href))
            return (
              <Button
                key={href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-gray-600"
                )}
              >
                <Link href={href} className="flex items-center w-full">
                  <Icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-500")} />
                  <span className="ml-2 font-medium">{label}</span>
                </Link>
              </Button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 pt-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2 font-medium">Logout</span>
          </Button>
        </div>

        <div className="mt-auto text-xs text-gray-400 px-2">© {new Date().getFullYear()} UptimeX</div>
      </div>
    </aside>
  )
}


