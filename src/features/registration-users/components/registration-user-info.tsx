"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle, DetailRow } from "@/shared/components";

import { GUEST_TYPE_LABEL_KEYS } from "../constants";

import type { RegistrationUserDetails } from "../types";

type RegistrationUserInfoProps = {
  user: RegistrationUserDetails;
};

function RegistrationUserInfo({ user }: RegistrationUserInfoProps) {
  const t = useTranslations("registrationUsers");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("customerInformationTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-12">
          <div className="flex min-w-0 flex-col gap-4">
            <DetailRow label={t("fieldFullName")} value={user.name} />
            <DetailRow label={t("fieldPhone")} value={user.phoneNumber} />
            <DetailRow
              label={t("fieldAccountType")}
              value={t(GUEST_TYPE_LABEL_KEYS[user.guestType])}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <DetailRow label={t("fieldEmail")} value={user.email} />
            <DetailRow label={t("fieldRegisteredAt")} value={user.registeredAt} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { RegistrationUserInfo };
