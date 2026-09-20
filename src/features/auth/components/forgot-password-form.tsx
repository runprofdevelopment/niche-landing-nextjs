"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";


import { routes } from "@/constants/routes";
import { AuthCard, AuthCardFooter, AuthCardHeader } from "@/features/auth/components/auth-card";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth.schema";
import { requestPasswordReset } from "@/features/auth/services/auth-api";
import { useTranslations } from "@/hooks/useTranslations";
import { Link, useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { handleError } = useErrorHandler();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await requestPasswordReset(values.email);
      toast.success(t("resetLinkSent"));
      router.push({
        pathname: routes.checkEmail,
        query: { email: values.email },
      });
    } catch (error) {
      handleError(error, { context: { feature: "auth", action: "passwordReset" } });
    }
  });

  return (
    <AuthCard>
      <AuthCardHeader
        icon={<LockKeyhole className="size-5" />}
        title={t("forgotPasswordTitle")}
        description={t("forgotPasswordDescription")}
      />
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            label={t("emailLabel")}
            required
            render={(field) => (
              <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
            )}
          />
          <Button
            type="submit"
            className="h-11 w-full rounded-sm"
            disabled={form.formState.isSubmitting}
          >
            {t("sendResetLink")}
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
