"use client";

import { Mail } from "lucide-react";

import { routes } from "@/constants/routes";
import { AuthCard, AuthCardFooter, AuthCardHeader } from "@/features/auth/components/auth-card";
import { useTranslations } from "@/hooks/useTranslations";
import { Link, useSearchParams } from "@/providers/i18n";
import { Button } from "@/shared/components/ui/button";

export function CheckEmailForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  return (
    <AuthCard>
      <AuthCardHeader
        icon={<Mail className="size-5" />}
        title={t("checkEmailTitle")}
        description={
          email ? `${t("checkEmailDescription")} (${email})` : t("checkEmailDescription")
        }
      />
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">{t("checkEmailHint")}</p>
        <Button asChild className="h-11 w-full rounded-sm">
          <Link href={routes.forgotPassword}>{t("backToForgotPassword")}</Link>
        </Button>
      </div>
      <AuthCardFooter>
        <Link href={routes.login} className="font-medium text-foreground hover:underline">
          {t("backToSignIn")}
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
