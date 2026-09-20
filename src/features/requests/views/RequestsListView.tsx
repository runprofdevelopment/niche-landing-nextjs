"use client";

import { useState } from "react";

import { REQUEST_PERMISSIONS } from "@/constants/permissions";
import { useTranslations } from "@/hooks/useTranslations";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Badge } from "@/shared/components/ui/badge";

import { RequestsTable } from "../components/tables";

export default function RequestsListView() {
  const t = useTranslations("requests");
  const [totalCount, setTotalCount] = useState(0);

  return (
    <PermissionGate permission={REQUEST_PERMISSIONS.view}>
      <div className="flex min-h-0 min-w-0 flex-col gap-6">
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">{t("listTitle")}</h1>
          <Badge className="rounded-full bg-primary px-2.5 text-primary-foreground">
            {totalCount}
          </Badge>
        </div>

        <RequestsTable onTotalCountChange={setTotalCount} />
      </div>
    </PermissionGate>
  );
}
