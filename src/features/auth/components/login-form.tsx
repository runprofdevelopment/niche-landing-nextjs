"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { isFirebaseConfigured } from "@/config/env";
import { routes } from "@/constants/routes";
import { AuthCard, AuthCardFooter, AuthCardHeader } from "@/features/auth/components/auth-card";
import { PasswordInput } from "@/features/auth/components/password-input";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { hasAssignedRoles } from "@/features/auth/types";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/providers/auth/useAuth";
import { Link, useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const { handleError } = useErrorHandler();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!isFirebaseConfigured()) {
      toast.error(t("firebaseNotConfigured"));
      return;
    }

    try {
      const profile = await signIn(values.email, values.password, values.rememberMe !== false);

      if (!profile) {
        await signOut();
        toast.error(t("profileLoadFailed"));
        return;
      }

      // Gate on authMe before any dashboard navigation.
      if (!profile.emailVerified) {
        toast.message(t("verificationRequired"));
        router.push({
          pathname: routes.verifyEmail,
          query: { email: profile.email || values.email },
        });
        return;
      }

      if (profile.profileType !== "staff") {
        await signOut();
        toast.error(t("dashboardAccessDenied"));
        return;
      }

      if (!hasAssignedRoles(profile)) {
        toast.message(t("pendingApprovalToast"));
        router.push(routes.pendingApproval);
        return;
      }

      toast.success(t("loginSuccess"));
      router.push(routes.dashboard);
    } catch (error) {
      handleError(error, { context: { feature: "auth", action: "signIn" } });
    }
  });

  return (
    <AuthCard>
      <AuthCardHeader title={t("loginTitle")} description={t("loginDescription")} />
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            label={t("emailLabel")}
            render={(field) => (
              <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
            )}
          />
          <FormField
            control={form.control}
            name="password"
            label={t("passwordLabel")}
            render={(field) => <PasswordInput {...field} />}
          />
          <div className="flex items-center justify-between gap-3">
            <FormField
              control={form.control}
              name="rememberMe"
              render={(field) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal">
                    {t("rememberMe")}
                  </Label>
                </div>
              )}
            />
            <Link
              href={routes.forgotPassword}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-sm"
            disabled={form.formState.isSubmitting}
          >
            {t("signIn")}
          </Button>
        </form>
      </Form>
      <AuthCardFooter>
        {t("noAccount")}{" "}
        <Link href={routes.register} className="font-semibold text-primary hover:underline">
          {t("signUp")}
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
