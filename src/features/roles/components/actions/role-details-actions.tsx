"use client";

import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import { Button } from "@/shared/components";

import { useRolePermissions } from "../../hooks";

type RoleDetailsActionsProps = {
  roleId: string;
};

function RoleDetailsActions({ roleId }: RoleDetailsActionsProps) {
  const t = useTranslations("roles");
  const router = useRouter();
  const { canUpdate } = useRolePermissions();

  if (!canUpdate) {
    return null;
  }

  return (
    <Button type="button" onClick={() => router.push(routes.usersRoleEdit(roleId))}>
      {t("editRole")}
    </Button>
  );
}

export { RoleDetailsActions };
