"use client";

import { useEffect } from "react";

import { isFirebaseConfigured } from "@/config/env";
import { routes } from "@/constants/routes";
import { canAccessDashboard, isPendingApproval } from "@/features/auth/types";
import { useHydrated } from "@/features/events/hooks/useHydrated";
import { useAuth } from "@/providers/auth/useAuth";
import { useRouter } from "@/providers/i18n";

import { AuthSessionLoading, AuthSessionSkeleton } from "./auth-session-loading";

type AuthGuardProps = {
  children: React.ReactNode;
};

/** Brief wait before bouncing an authenticated-but-blocked session to login. */
const ACCESS_GRACE_MS = 600;

/** Protect dashboard routes — verified staff with roles (or owner). */
export function AuthGuard({ children }: AuthGuardProps) {
  const hydrated = useHydrated();
  const { isAuthenticated, isLoading, profile } = useAuth();
  const router = useRouter();
  const canAccess = isAuthenticated && canAccessDashboard(profile);
  const pendingApproval = isAuthenticated && isPendingApproval(profile);

  useEffect(() => {
    if (!hydrated || !isFirebaseConfigured() || isLoading || canAccess) return;

    if (pendingApproval) {
      router.replace(routes.pendingApproval);
      return;
    }

    // Authenticated but not yet allowed — short grace for profile settle (A1 soft-fail).
    if (isAuthenticated) {
      const timer = window.setTimeout(() => {
        router.replace(routes.login);
      }, ACCESS_GRACE_MS);
      return () => window.clearTimeout(timer);
    }

    router.replace(routes.login);
    return;
  }, [canAccess, hydrated, isAuthenticated, isLoading, pendingApproval, router]);

  if (!hydrated) {
    return <AuthSessionLoading />;
  }

  if (!isFirebaseConfigured()) {
    return children;
  }

  if (canAccess) {
    return children;
  }

  // Cold bootstrap: no Firebase user yet → full-screen loading is fine.
  if (isLoading && !isAuthenticated) {
    return <AuthSessionLoading />;
  }

  // Soft hold: session exists (or redirect pending) — avoid fullscreen freeze feel (A3).
  return <AuthSessionSkeleton />;
}
