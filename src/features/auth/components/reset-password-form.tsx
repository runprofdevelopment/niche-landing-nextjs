"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { confirmPasswordReset } from "firebase/auth";
import { LockKeyhole } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";


import { isFirebaseConfigured } from "@/config/env";
import { routes } from "@/constants/routes";
import { AuthCard, AuthCardFooter, AuthCardHeader } from "@/features/auth/components/auth-card";
import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useTranslations } from "@/hooks/useTranslations";
import { Link, useRouter, useSearchParams } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { getFirebaseAuth } from "@/services/firebase/auth";
import { toast } from "@/shared/components/feedback/toast";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const mode = searchParams.get("mode");
  const { handleError } = useErrorHandler();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";
  const canReset = Boolean(oobCode) && (!mode || mode === "resetPassword");

  const onSubmit = form.handleSubmit(async (values) => {
    if (!isFirebaseConfigured()) {
      toast.error(t("firebaseNotConfigured"));
      return;
    }

    if (!canReset) {
      toast.error(t("resetLinkInvalid"));
      return;
    }

    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, values.password);
      toast.success(t("passwordUpdated"));
      router.push(routes.login);
    } catch (error) {
      handleError(error, { context: { feature: "auth", action: "confirmPasswordReset" } });
    }
  });

  return (
    <AuthCard>
      <AuthCardHeader
        icon={<LockKeyhole className="size-5" />}
        title={t("resetPasswordTitle")}
        description={t("resetPasswordDescription")}
      />
      {!canReset ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">{t("resetLinkInvalid")}</p>
          <Button asChild className="h-11 w-full rounded-sm">
            <Link href={routes.forgotPassword}>{t("backToForgotPassword")}</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              label={t("passwordLabel")}
              required
              render={(field) => <PasswordInput {...field} />}
            />
            <PasswordRequirements password={password} />
            <FormField
              control={form.control}
              name="confirmPassword"
              label={t("confirmPasswordLabel")}
              required
              render={(field) => <PasswordInput {...field} />}
            />
            <Button
              type="submit"
              className="h-11 w-full rounded-sm"
              disabled={form.formState.isSubmitting}
            >
              {t("setPassword")}
            </Button>
          </form>
        </Form>
      )}
      <AuthCardFooter>
        <Link href={routes.login} className="font-medium text-foreground hover:underline">
          {t("backToSignIn")}
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
