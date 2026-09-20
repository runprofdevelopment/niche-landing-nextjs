"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/providers/auth/useAuth";
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
import { Input } from "@/shared/components/ui/input";
import { InternationalPhoneInput } from "@/shared/components/ui/international-phone-input";
import { fromApiDialCode, toApiDialCode } from "@/shared/utils/international-phone";

import { staffUpdateProfileOperation } from "../graphql/operations/settings.operations";
import { profileSettingsSchema, type ProfileSettingsFormValues } from "../schemas/settings.schema";

import { ProfileAvatarField } from "./profile-avatar-field";

import type { StaffAvatarInput } from "../graphql/mutations/staff-update-profile";
import type { MeProfile } from "@/features/auth/types";

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "NS";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function mapAvatarFromProfile(profile: MeProfile | null | undefined): StaffAvatarInput | null {
  if (!profile) return null;
  if (profile.avatar) {
    return {
      id: profile.avatar.id,
      name: profile.avatar.name ?? null,
      new: false,
      publicUrl: profile.avatar.publicUrl ?? profile.photoURL ?? null,
    };
  }
  if (profile.photoURL) {
    return {
      id: "",
      new: false,
      publicUrl: profile.photoURL,
    };
  }
  return null;
}

export function ProfileSettingsForm() {
  const t = useTranslations("settings");
  const { profile, refreshProfile } = useAuth();
  const { handleError } = useErrorHandler();

  const serverAvatar = useMemo(() => mapAvatarFromProfile(profile), [profile]);
  /** `undefined` = use server avatar; otherwise a local upload draft. */
  const [avatarDraft, setAvatarDraft] = useState<StaffAvatarInput | null | undefined>(undefined);
  const avatar = avatarDraft === undefined ? serverAvatar : avatarDraft;

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "SA",
      phone: "",
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      fullName: profile.fullName ?? "",
      email: profile.email ?? "",
      countryCode: fromApiDialCode(profile.countryCode ?? "SA"),
      phone: profile.phoneNumber ?? "",
    });
  }, [form, profile]);

  const countryCode = useWatch({ control: form.control, name: "countryCode" }) ?? "SA";
  const fullName = useWatch({ control: form.control, name: "fullName" }) ?? "";
  const email = useWatch({ control: form.control, name: "email" }) ?? "";
  const initials = useMemo(() => getInitials(fullName, email), [email, fullName]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await staffUpdateProfileOperation({
        fullName: values.fullName.trim(),
        countryCode: toApiDialCode(values.countryCode),
        phoneNumber: values.phone.trim(),
        ...(avatar ? { avatar } : {}),
      });
      await refreshProfile();
      setAvatarDraft(undefined);
      toast.success(t("profileUpdated"));
    } catch (error) {
      handleError(error, { context: { feature: "settings", action: "staffUpdateProfile" } });
    }
  });

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader className="gap-1 border-b border-border/70 pb-5">
        <CardTitle className="text-lg font-semibold">{t("informationProfileTitle")}</CardTitle>
        <CardDescription>{t("informationProfileDescription")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate>
          <CardContent className="space-y-6 pt-6">
            <ProfileAvatarField initials={initials} value={avatar} onChange={setAvatarDraft} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                label={t("nameLabel")}
                required
                render={(field) => <Input placeholder={t("namePlaceholder")} {...field} />}
              />
              <FormField
                control={form.control}
                name="email"
                label={t("emailLabel")}
                render={(field) => <Input type="email" disabled {...field} />}
              />
              <FormField
                control={form.control}
                name="phone"
                label={t("phoneLabel")}
                required
                className="sm:col-span-2"
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
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-border/70 pt-5">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {t("saveChanges")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
