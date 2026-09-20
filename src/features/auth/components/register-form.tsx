"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { isFirebaseConfigured } from "@/config/env";
import { routes } from "@/constants/routes";
import { AuthCard, AuthCardFooter, AuthCardHeader } from "@/features/auth/components/auth-card";
import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { AUTH_DEPARTMENTS } from "@/features/auth/constants/departments";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas/auth.schema";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/providers/auth/useAuth";
import { Link, useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { InternationalPhoneInput } from "@/shared/components/ui/international-phone-input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { signUp } = useAuth();
  const { handleError } = useErrorHandler();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "SA",
      phone: "",
      department: "operations",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });
  const countryCode = useWatch({ control: form.control, name: "countryCode" }) ?? "SA";
  const acceptTerms = useWatch({ control: form.control, name: "acceptTerms" });
  const password = useWatch({ control: form.control, name: "password" }) ?? "";

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (!isFirebaseConfigured()) {
        toast.error(t("firebaseNotConfigured"));
        return;
      }

      try {
        await signUp({
          fullName: values.fullName,
          email: values.email,
          countryCode: values.countryCode,
          phoneNumber: values.phone,
          department: values.department,
          password: values.password,
        });
        toast.success(t("registrationSuccess"));
        router.push({
          pathname: routes.verifyEmail,
          query: { email: values.email },
        });
      } catch (error) {
        handleError(error, { context: { feature: "auth", action: "signUp" } });
      }
    },
    () => {
      toast.error(t("registrationValidationFailed"));
    },
  );

  return (
    <AuthCard>
      <AuthCardHeader title={t("registerTitle")} description={t("registerDescription")} />
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            label={t("fullNameLabel")}
            required
            render={(field) => <Input placeholder={t("fullNamePlaceholder")} {...field} />}
          />
          <FormField
            control={form.control}
            name="email"
            label={t("emailLabel")}
            required
            render={(field) => (
              <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            label={t("phoneLabel")}
            required
            render={(field, fieldState) => (
              <InternationalPhoneInput
                value={{
                  countryCode,
                  phone: field.value,
                }}
                onChange={({ countryCode: nextCountryCode, phone }) => {
                  form.setValue("countryCode", nextCountryCode, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  field.onChange(phone);
                  void form.trigger("phone");
                }}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid || undefined}
              />
            )}
          />
          <FormField
            control={form.control}
            name="department"
            label={t("departmentLabel")}
            required
            render={(field) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={AUTH_DEPARTMENTS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
              />
            )}
          />
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
          <FormField
            control={form.control}
            name="acceptTerms"
            render={(field) => (
              <div className="flex items-start gap-2">
                <Checkbox
                  id="accept-terms"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <Label htmlFor="accept-terms" className="text-sm font-normal leading-snug">
                  {t("acceptTerms")}
                </Label>
              </div>
            )}
          />
          <Button
            type="submit"
            className="h-11 w-full rounded-sm"
            disabled={form.formState.isSubmitting || acceptTerms !== true}
          >
            {t("createAccount")}
          </Button>
        </form>
      </Form>
      <AuthCardFooter>
        {t("hasAccount")}{" "}
        <Link href={routes.login} className="font-semibold text-primary hover:underline">
          {t("signIn")}
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
