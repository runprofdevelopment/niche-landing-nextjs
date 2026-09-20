"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { changeMyPasswordOperation } from "../graphql/operations/settings.operations";
import { changePasswordSchema, type ChangePasswordFormValues } from "../schemas/settings.schema";

export function SecuritySettingsForm() {
  const t = useTranslations("settings");
  const { handleError } = useErrorHandler();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = useWatch({ control: form.control, name: "newPassword" }) ?? "";

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const ok = await changeMyPasswordOperation(values.oldPassword, values.newPassword);
      if (!ok) {
        toast.error(t("passwordUpdateFailed"));
        return;
      }
      form.reset();
      toast.success(t("passwordUpdated"));
    } catch (error) {
      handleError(error, { context: { feature: "settings", action: "changeMyPassword" } });
    }
  });

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader className="gap-1 border-b border-border/70 pb-5">
        <CardTitle className="text-lg font-semibold">{t("securityTitle")}</CardTitle>
        <CardDescription>{t("securityDescription")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="oldPassword"
                label={t("currentPasswordLabel")}
                required
                render={(field) => <PasswordInput {...field} />}
              />
              <FormField
                control={form.control}
                name="newPassword"
                label={t("newPasswordLabel")}
                required
                render={(field) => (
                  <PasswordInput placeholder={t("newPasswordPlaceholder")} {...field} />
                )}
              />
              <div className="sm:col-span-2">
                <PasswordRequirements password={newPassword} />
              </div>
              <FormField
                control={form.control}
                name="confirmPassword"
                label={t("confirmPasswordLabel")}
                required
                className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]"
                render={(field) => (
                  <PasswordInput placeholder={t("confirmPasswordPlaceholder")} {...field} />
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-border/70 pt-5">
            <Button type="submit" variant="outline" disabled={form.formState.isSubmitting}>
              {t("updatePassword")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
