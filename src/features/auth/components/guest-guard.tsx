"use client";

import { useEffect } from "react";

import { isFirebaseConfigured } from "@/config/env";
import { routes } from "@/constants/routes";
import { canAccessDashboard, isPendingApproval } from "@/features/auth/types";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuth } from "@/providers/auth/useAuth";
import { usePathname, useRouter } from "@/providers/i18n";

import { AuthSessionLoading } from "./auth-session-loading";

import type { MeProfile } from "@/features/auth/services/auth-api";

type GuestGuardProps = {
  children: React.ReactNode;
};

const FLOW_PATHS = new Set<string>([routes.verifyEmail, routes.resetPassword, routes.checkEmail]);

type RedirectTarget =
  | string
  | {
      pathname: string;
      query: { email?: string };
    };

function resolveGuestRedirect(input: {
  hydrated: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  pathname: string;
  profile: MeProfile | null;
  email?: string | null | undefined;
}): RedirectTarget | null {
  if (!input.hydrated || !isFirebaseConfigured() || input.isLoading || !input.isAuthenticated) {
    return null;
  }
  if (FLOW_PATHS.has(input.pathname)) return null;

  if (input.profile && !input.profile.emailVerified) {
    const email = input.profile.email || input.email;
    return {
      pathname: routes.verifyEmail,
      ...(email ? { query: { email } } : { query: {} }),
    };
  }

  if (isPendingApproval(input.profile)) {
    if (input.pathname === routes.pendingApproval) return null;
    return routes.pendingApproval;
  }

  if (canAccessDashboard(input.profile)) {
    return routes.dashboard;
  }

  return null;
}

/** Redirect authenticated users away from auth pages — except active verify/reset flows. */
export function GuestGuard({ children }: GuestGuardProps) {
  const hydrated = useHydrated();
  const { isAuthenticated, isLoading, user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const redirectTarget = resolveGuestRedirect({
    hydrated,
    isLoading,
    isAuthenticated,
    pathname,
    profile,
    ...(user?.email ? { email: user.email } : {}),
  });

  useEffect(() => {
    if (!redirectTarget) return;
    router.replace(redirectTarget);
  }, [redirectTarget, router]);

  // Don't paint the login form while a session is still resolving or a redirect is queued.
  if (!hydrated || (isFirebaseConfigured() && isLoading) || redirectTarget) {
    return <AuthSessionLoading />;
  }

  return children;
}
