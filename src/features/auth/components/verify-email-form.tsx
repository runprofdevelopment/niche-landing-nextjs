"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { routes } from "@/constants/routes";
import { AuthCard, AuthCardFooter, AuthCardHeader } from "@/features/auth/components/auth-card";
import { verifyEmailSchema, type VerifyEmailFormValues } from "@/features/auth/schemas/auth.schema";
import { resendVerificationCode, verifyEmailWithCode } from "@/features/auth/services/auth-api";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/providers/auth/useAuth";
import { useSearchParams, Link, useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";

const RESEND_COOLDOWN_SECONDS = 120;

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function VerifyEmailForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { signOut, user, isAuthenticated, refreshProfile } = useAuth();
  const { handleError } = useErrorHandler();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!isAuthenticated) {
      toast.error(t("verifyEmailSessionRequired"));
      router.push(routes.login);
      return;
    }

    try {
      const verified = await verifyEmailWithCode(values.code);
      if (!verified) {
        toast.message(t("verifyEmailPending"));
        return;
      }

      await refreshProfile();
      toast.success(t("verifyEmailSuccess"));
      await signOut();
      router.push(routes.login);
    } catch (error) {
      handleError(error, { context: { feature: "auth", action: "verifyEmail" } });
    }
  });

  const handleResend = async () => {
    if (cooldown > 0) return;

    if (!isAuthenticated) {
      toast.error(t("verifyEmailSessionRequired"));
      router.push(routes.login);
      return;
    }

    try {
      await resendVerificationCode();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(t("verificationSent"));
    } catch (error) {
      handleError(error, { context: { feature: "auth", action: "resendVerificationCode" } });
    }
  };

  const displayEmail = email || user?.email || "";

  return (
    <AuthCard>
      <AuthCardHeader
        icon={<Mail className="size-5" />}
        title={t("verifyEmailTitle")}
        description={
          displayEmail
            ? `${t("verifyEmailDescription")} (${displayEmail})`
            : t("verifyEmailDescription")
        }
      />
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={(field) => (
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={field.value ?? ""} onChange={field.onChange}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}
          />
          <p className="text-center text-sm text-muted-foreground">
            {t("resendPrompt")}{" "}
            {cooldown > 0 ? (
              <span className="font-medium text-foreground">
                {t("resendAvailableIn", { time: formatCountdown(cooldown) })}
              </span>
            ) : (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={handleResend}
              >
                {t("resendCode")}
              </button>
            )}
          </p>
          <Button
            type="submit"
            className="h-11 w-full rounded-sm"
            disabled={form.formState.isSubmitting}
          >
            {t("verifyEmail")}
          </Button>
        </form>
      </Form>
      <AuthCardFooter>
        <Link href={routes.login} className="font-medium text-foreground hover:underline">
          {t("backToSignIn")}
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
