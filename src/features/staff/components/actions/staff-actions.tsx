"use client";

import { Plus } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import { Button } from "@/shared/components";

import { useStaffPermissions } from "../../hooks";

function StaffActions() {
  const t = useTranslations("staff");
  const router = useRouter();
  const { canCreate } = useStaffPermissions();

  if (!canCreate) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={() => router.push("/users/staff/create")}>
        <Plus className="size-4" />
        {t("addNewStaff")}
      </Button>
    </div>
  );
}

export { StaffActions };
