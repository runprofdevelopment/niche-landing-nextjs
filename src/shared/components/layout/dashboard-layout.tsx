"use client";

import { SIDEBAR_RAIL_WIDTH } from "@/config/site";
import { DashboardHeader } from "@/shared/components/layout/dashboard-header";
import { DashboardSidebar } from "@/shared/components/navigation/dashboard-sidebar";
import { SidebarProvider } from "@/shared/components/ui/sidebar";

import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false} className="h-svh max-h-svh min-h-0 overflow-hidden">
      <div
        className="flex h-full min-h-0 w-full flex-col overflow-hidden p-4"
        style={{ "--sidebar-rail-width": SIDEBAR_RAIL_WIDTH } as React.CSSProperties}
      >
        <DashboardHeader />
        <div className="mt-8 flex min-h-0 flex-1 gap-4 overflow-hidden">
          <DashboardSidebar />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
