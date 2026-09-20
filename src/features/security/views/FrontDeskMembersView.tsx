"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { SECURITY_PERMISSIONS } from "@/constants/permissions";
import { useFrontDeskMutations } from "@/features/security/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

import { MemberFormDialog } from "../components/dialogs";
import { MembersTable, type MembersTab } from "../components/tables";

import type { SecurityMemberFormValues } from "../schemas/member.schema";

export default function FrontDeskMembersView() {
  const t = useTranslations("security");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const { createFrontDesk } = useFrontDeskMutations();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<MembersTab>("active");
  const [totalCount, setTotalCount] = useState(0);
  const canCreate = can(SECURITY_PERMISSIONS.membersCreate);

  async function handleAdd(values: SecurityMemberFormValues) {
    try {
      await createFrontDesk(values);
      toast.success(t("memberAdded"));
      setTab("pending");
    } catch (error) {
      handleError(error, { context: { feature: "security", action: "frontDeskCreate" } });
      throw error;
    }
  }

  return (
    <PermissionGate permission={SECURITY_PERMISSIONS.view}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold">{t("frontDeskMembersTitle")}</h1>
            <Badge className="rounded-full bg-primary px-2.5 text-primary-foreground">
              {totalCount}
            </Badge>
          </div>

          {canCreate ? (
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="me-1 size-4" /> {t("addMember")}
            </Button>
          ) : null}
        </div>

        {canCreate ? (
          <MemberFormDialog open={open} onOpenChange={setOpen} mode="add" onSubmit={handleAdd} />
        ) : null}

        <MembersTable tab={tab} onTabChange={setTab} onTotalCountChange={setTotalCount} />
      </div>
    </PermissionGate>
  );
}
