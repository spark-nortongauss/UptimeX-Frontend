"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  LogOut, 
  Eye, 
  Headphones, 
  Package, 
  Settings,
  BarChart3,
  Search,
  Map,
  AlertTriangle,
  AlertCircle,
  Wrench,
  FileText,
  Ticket,
  AlertOctagon,
  Bug,
  Server,
  Plus,
  Rack,
  Building,
  Circle
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/authStore"
import { toast } from "sonner"

const navigationItems = [
  {
    label: "Observability",
    icon: Eye,
    href: "/observability",
    children: [
      { label: "Overview", href: "/observability/overview", icon: BarChart3 },
      { label: "Detailed", href: "/observability/detailed", icon: Search },
      { label: "Topology Map", href: "/observability/topology", icon: Map },
      { label: "Events", href: "/observability/events", icon: AlertTriangle },
      { label: "Incidents", href: "/observability/incidents", icon: AlertCircle },
      { label: "Problems", href: "/observability/problems", icon: Wrench },
      { label: "Services", href: "/observability/services", icon: Server },
      { label: "Reports", href: "/observability/reports", icon: FileText },
    ]
  },
  {
    label: "Support",
    icon: Headphones,
    href: "/support",
    children: [
      { label: "Tickets", href: "/support/tickets", icon: Ticket },
      { label: "Major Incidents", href: "/support/major-incidents", icon: AlertOctagon },
      { label: "Problems", href: "/support/problems", icon: Bug },
      { label: "Reports", href: "/support/reports", icon: FileText },
    ]
  },
  {
    label: "Inventory",
    icon: Package,
    href: "/inventory",
    children: [
      { label: "Assets", href: "/inventory/assets", icon: Server },
      { label: "New Provisioning", href: "/inventory/provisioning", icon: Plus },
      { label: "Racks", href: "/inventory/racks", icon: Rack },
      { label: "Facilities", href: "/inventory/facilities", icon: Building },
    ]
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    children: []
  }
]

export default function Sidebar({ isCollapsed, onToggle, isMobile, isMobileSidebarOpen, onCloseMobileSidebar }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState(new Set())

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

  const toggleExpanded = (label) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const isItemActive = (item) => {
    if (item.href === pathname) return true
    if (item.children) {
      return item.children.some(child => pathname?.startsWith(child.href))
    }
    return false
  }

  const checkChildActive = (child) => {
    return pathname === child.href || pathname?.startsWith(child.href)
  }

  return (
    <aside className={`shrink-0 border-r border-gray-200/80 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300 ease-out ${
      isMobile 
        ? `fixed top-14 left-0 h-[calc(100vh-56px)] w-64 z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`
        : `hidden md:flex ${isCollapsed ? 'w-16' : 'w-64 lg:w-72'}`
    }`}>
      <div className="flex h-[calc(100vh-56px)] sticky top-14 flex-col gap-4 p-4 relative">
        {/* Collapse/Expand Button - Only show on desktop */}
        {!isMobile && (
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-gray-600" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-gray-600" />
            )}
          </Button>
        )}
        <nav className="flex-1 space-y-1">
          {navigationItems.map((item) => {
            const isActive = isItemActive(item)
            const isExpanded = expandedItems.has(item.label)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.label}>
                {/* Main Navigation Item */}
                <div className="flex items-center">
                  {hasChildren ? (
                    <Button
                      onClick={() => toggleExpanded(item.label)}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10 text-gray-600 hover:text-gray-900",
                        isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      )}
                    >
                      {item.icon ? (
                        <item.icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-500")} />
                      ) : (
                        <Circle className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-500")} />
                      )}
                      {!isCollapsed && (
                        <>
                          <span className="ml-2 font-medium transition-opacity duration-200 ease-out">{item.label}</span>
                          <div className="ml-auto transition-transform duration-200 ease-out">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-10",
                        isActive ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-gray-600"
                      )}
                    >
                      <Link href={item.href} className="flex items-center w-full" onClick={isMobile ? onCloseMobileSidebar : undefined}>
                        {item.icon ? (
                          <item.icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-500")} />
                        ) : (
                          <Circle className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-500")} />
                        )}
                        {(!isCollapsed || isMobile) && <span className="ml-2 font-medium transition-opacity duration-200 ease-out">{item.label}</span>}
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Submenu Items */}
                {hasChildren && isExpanded && (!isCollapsed || isMobile) && (
                  <div className="ml-6 mt-1 space-y-1 transition-all duration-200 ease-out">
                    {item.children.map((child) => {
                      const isChildActive = checkChildActive(child)
                      return (
                        <Button
                          key={child.href}
                          asChild
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 h-9 text-sm",
                            isChildActive ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          <Link href={child.href} className="flex items-center w-full" onClick={isMobile ? onCloseMobileSidebar : undefined}>
                            {child.icon ? (
                              <child.icon className={cn("h-4 w-4", isChildActive ? "text-blue-700" : "text-gray-500")} />
                            ) : (
                              <Circle className={cn("h-4 w-4", isChildActive ? "text-blue-700" : "text-gray-500")} />
                            )}
                            <span className="ml-2 font-medium">{child.label}</span>
                          </Link>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
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
            {(!isCollapsed || isMobile) && <span className="ml-2 font-medium transition-opacity duration-200 ease-out">Logout</span>}
          </Button>
        </div>

        {(!isCollapsed || isMobile) && (
          <div className="mt-auto text-xs text-gray-400 px-2 transition-opacity duration-200 ease-out">© {new Date().getFullYear()} UptimeX</div>
        )}
      </div>
    </aside>
  )
}


