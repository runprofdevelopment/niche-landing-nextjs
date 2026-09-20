"use client";

import { Plus } from "lucide-react";

import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import { Button } from "@/shared/components";

import { useRolePermissions } from "../../hooks";

function RoleActions() {
  const t = useTranslations("roles");
  const router = useRouter();
  const { canCreate } = useRolePermissions();

  if (!canCreate) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={() => router.push(routes.usersRoleCreate)}>
        <Plus className="size-4" />
        {t("addNewRole")}
      </Button>
    </div>
  );
}

export { RoleActions };
