"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle, DetailRow, Switch } from "@/shared/components";

import type { RoleDetails } from "../types";

type RoleDetailsInfoProps = {
  role: RoleDetails;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function RoleDetailsInfo({ role }: RoleDetailsInfoProps) {
  const t = useTranslations("roles");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("roleDetailsTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-12">
          <div className="flex flex-col gap-4">
            <DetailRow label={t("fieldRoleId")} value={role.id} />
            <DetailRow label={t("fieldRoleName")} value={role.name} />
            <DetailRow label={t("fieldCreatedBy")} value={role.createdBy} />
            <DetailRow
              label={t("fieldActiveStatus")}
              value={<Switch checked={role.isActive} disabled />}
            />
          </div>
          <div className="flex flex-col gap-4">
            <DetailRow label={t("fieldCreatedAt")} value={formatDateTime(role.createdAt)} />
            <DetailRow label={t("fieldUpdatedBy")} value={role.updatedBy} />
            <DetailRow label={t("fieldUpdatedAt")} value={formatDateTime(role.updatedAt)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { RoleDetailsInfo };
