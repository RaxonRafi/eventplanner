"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { ModeToggle } from "@/components/ui/modeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <div className="relative flex-1">
        {/* Sits in the right side of each page's h-16 header */}
        <div className="absolute right-4 top-3 z-20 flex items-center gap-2">
          <NotificationBell />
          <ModeToggle />
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
}
