"use client" // Sidebar interactions require client components

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusCircle, Archive, Settings, LayoutDashboard, FileText, Wrench, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar, // [^1]
} from "@/components/ui/sidebar" // Assuming these are available from shadcn/ui setup [^1]
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/anomalies/add", label: "Add Anomaly", icon: PlusCircle },
  { href: "/maintenance-windows", label: "Maintenance", icon: Wrench },
  { href: "/archived-anomalies", label: "Archived", icon: Archive },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state, open, toggleSidebar } = useSidebar() // [^1]

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      {" "}
      {/* [^1] */}
      <SidebarHeader className="p-2 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6" />
          <span className={cn("font-semibold", state === "collapsed" && "hidden")}>TAQA Anomaly</span>
        </Link>
        {/* On desktop, the trigger is part of the sidebar component itself or via SidebarRail.
            This button is more for a manual toggle if needed, or for mobile.
            The SidebarTrigger in MainAppLayout handles mobile.
        */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden group-data-[collapsible=icon]:hidden md:inline-flex"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(state === "collapsed" && "hidden")}>Management</SidebarGroupLabel>{" "}
          {/* [^1] */}
          <SidebarMenu>
            {" "}
            {/* [^1] */}
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {" "}
                {/* [^1] */}
                <SidebarMenuButton // [^1]
                  asChild
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className={cn(state === "collapsed" && "sr-only")}>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "Settings", side: "right", align: "center" }}>
              <Settings className="h-5 w-5" />
              <span className={cn(state === "collapsed" && "sr-only")}>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* <SidebarRail /> */} {/* Optional: for resizable rail [^1] */}
    </Sidebar>
  )
}
