"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
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
  Layers,
  Building,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/authStore"
import { toast } from "sonner"

const navigationItems = [
  {
    title: "Observability",
    icon: Eye,
    items: [
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
    title: "Support",
    icon: Headphones,
    items: [
      { label: "Tickets", href: "/support/tickets", icon: Ticket },
      { label: "Major Incidents", href: "/support/major-incidents", icon: AlertOctagon },
      { label: "Problems", href: "/support/problems", icon: Bug },
      { label: "Reports", href: "/support/reports", icon: FileText },
    ]
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { label: "Assets", href: "/inventory/assets", icon: Server },
      { label: "New Provisioning", href: "/inventory/provisioning", icon: Plus },
      { label: "Racks", href: "/inventory/racks", icon: Layers },
      { label: "Facilities", href: "/inventory/facilities", icon: Building },
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    items: []
  }
]

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuthStore()
  const [expandedGroups, setExpandedGroups] = useState(new Set())

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

  const isItemActive = (href) => {
    if (!pathname) return false
    return pathname === href || pathname.startsWith(href)
  }

  const toggleGroup = (title) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent className="pt-20">
      {navigationItems.map((section) => {
        const SectionIcon = section.icon
        const isExpanded = expandedGroups.has(section.title)
        const hasSubItems = section.items.length > 0

        return (
          <SidebarGroup key={section.title}>
            {hasSubItems ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => toggleGroup(section.title)}>
                    <SectionIcon className="h-4 w-4" />
                    <span>{section.title}</span>
                    <ChevronRight className={cn(
                      "ml-auto h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {isExpanded && (
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon
                      const isActive = isItemActive(item.href)
                      
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                          >
                            <Link href={item.href}>
                              {ItemIcon && <ItemIcon />}
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                )}
              </>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link href="/settings">
                    <SectionIcon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarGroup>
        )
      })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

