"use client";

import { INVITATION_PERMISSIONS } from "@/constants/permissions";
import { useTranslations } from "@/hooks/useTranslations";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Badge } from "@/shared/components/ui/badge";

import { InvitationsTable } from "../components/InvitationsTable";
import { useInvitationTemplateListQuery } from "../graphql";

export default function InvitationsListView() {
  const t = useTranslations("invitations");
  const { totalCount } = useInvitationTemplateListQuery({
    pagination: { limit: 1, page: 1 },
  });

  return (
    <PermissionGate permission={INVITATION_PERMISSIONS.view}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">{t("allInvitations")}</h1>
          <Badge className="rounded-full px-2.5 tabular-nums">{totalCount}</Badge>
        </div>

        <InvitationsTable />
      </div>
    </PermissionGate>
  );
}
