"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import { Button } from "@/shared/components";

import { useStaffPermissions } from "../../hooks";

import type { StaffDetails } from "../../types";

type StaffDetailsActionsProps = {
  staff: StaffDetails;
};

function StaffDetailsActions({ staff }: StaffDetailsActionsProps) {
  const t = useTranslations("staff");
  const router = useRouter();
  const { canUpdate } = useStaffPermissions();

  if (!canUpdate) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={() => router.push(`/users/staff/${staff.id}/edit`)}>
        {t("editStaff")}
      </Button>
    </div>
  );
}

export { StaffDetailsActions };
