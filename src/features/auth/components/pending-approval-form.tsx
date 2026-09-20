"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { routes } from "@/constants/routes";
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card";
import { canAccessDashboard, isPendingApproval } from "@/features/auth/types";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/providers/auth/useAuth";
import { useRouter } from "@/providers/i18n";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";

export function PendingApprovalForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { profile, refreshProfile, signOut, isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(routes.login);
      return;
    }

    if (canAccessDashboard(profile)) {
      router.replace(routes.dashboard);
      return;
    }

    if (profile && !isPendingApproval(profile)) {
      router.replace(routes.login);
    }
  }, [isAuthenticated, isLoading, profile, router]);

  const handleCheckApproval = async () => {
    setIsChecking(true);
    try {
      const next = await refreshProfile();
      if (canAccessDashboard(next)) {
        toast.success(t("pendingApprovalReady"));
        router.replace(routes.dashboard);
        return;
      }
      toast.message(t("pendingApprovalStillWaiting"));
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace(routes.login);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AuthCard>
      <AuthCardHeader
        icon={<Clock className="size-5" />}
        title={t("pendingApprovalTitle")}
        description={t("pendingApprovalDescription")}
      />
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">{t("pendingApprovalHint")}</p>
        <Button
          type="button"
          className="h-11 w-full rounded-sm"
          onClick={() => void handleCheckApproval()}
          disabled={isChecking || isSigningOut}
        >
          {t("pendingApprovalCheckAgain")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-sm"
          onClick={() => void handleSignOut()}
          disabled={isChecking || isSigningOut}
        >
          {t("backToSignIn")}
        </Button>
      </div>
    </AuthCard>
  );
}
