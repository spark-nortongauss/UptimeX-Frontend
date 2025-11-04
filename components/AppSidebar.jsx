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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
  SidebarTrigger,
  useSidebar,
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
import { useUIStore } from "@/lib/stores/uiStore"

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
  const { sidebarSearch, setSidebarSearch } = useUIStore()
  const { state } = useSidebar()

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

  const normalizedQuery = sidebarSearch.trim().toLowerCase()
  const filteredSections = normalizedQuery
    ? navigationItems
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (it) =>
              it.label.toLowerCase().includes(normalizedQuery) ||
              it.href.toLowerCase().includes(normalizedQuery)
          ),
        }))
        .filter((s) => s.items.length > 0)
    : navigationItems

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Logo and Sidebar Trigger Header */}
      <SidebarHeader className="!flex-row h-14 border-sidebar-border !p-2 flex items-center gap-2 shrink-0">
        {/* Logo only when sidebar is expanded */}
        {state === "expanded" && (
          <Link href="/observability/overview" className="flex items-center gap-2 shrink-0">
            <img src="/assets/observone_logo_1080p.png" alt="ObservOne logo" className="h-20 w-auto object-contain  ml-1 mt-2" />
          </Link>
        )}

        {/* Sidebar trigger - aligned with menu items */}
        <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground shrink-0 ml-auto mr-1" />
      </SidebarHeader>

      <SidebarContent>
        {/* Compact sidebar search */}
        <SidebarHeader className="pt-0 group-data-[collapsible=icon]:hidden">
          <div className="relative px-2 mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <SidebarInput
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search menu"
              className="pl-8 h-8 text-xs"
            />
          </div>
        </SidebarHeader>
      {filteredSections.map((section) => {
        const SectionIcon = section.icon
        const isSearching = normalizedQuery.length > 0
        const isExpanded = isSearching || expandedGroups.has(section.title)
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

