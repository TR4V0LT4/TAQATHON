// This layout will include the sidebar for the main application sections
import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar" // Assuming these are available [^1]

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col">
        {" "}
        {/* [^1] */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" /> {/* [^1] Show trigger on mobile */}
          {/* You can add breadcrumbs or page titles here */}
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
      </SidebarInset>
    </div>
  )
}
