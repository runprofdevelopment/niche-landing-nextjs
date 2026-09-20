"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DashboardLayout } from "@/shared/components/layout/dashboard-layout";

import type { ReactNode } from "react";

type DashboardRouteLayoutProps = {
  children: ReactNode;
};

export default function DashboardRouteLayout({ children }: DashboardRouteLayoutProps) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
