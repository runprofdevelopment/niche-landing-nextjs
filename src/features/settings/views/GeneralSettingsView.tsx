"use client";

import { SETTINGS_PERMISSIONS } from "@/constants/permissions";
import { useTranslations } from "@/hooks/useTranslations";
import { PermissionGate } from "@/shared/components/auth/permission-gate";

import { ProfileSettingsForm } from "../components/profile-settings-form";
import { SecuritySettingsForm } from "../components/security-settings-form";

export default function GeneralSettingsView() {
  const t = useTranslations("settings");

  return (
    <PermissionGate permission={SETTINGS_PERMISSIONS.view}>
      <div className=" space-y-6">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("pageDescription")}</p>
        </div>

        <ProfileSettingsForm />
        <SecuritySettingsForm />
      </div>
    </PermissionGate>
  );
}
