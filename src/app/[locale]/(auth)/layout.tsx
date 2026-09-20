import { AuthLayout } from "@/features/auth/components/auth-layout";
import { GuestGuard } from "@/features/auth/components/guest-guard";

import type { ReactNode } from "react";

type AuthRouteLayoutProps = {
  children: ReactNode;
};

export default function AuthRouteLayout({ children }: AuthRouteLayoutProps) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
