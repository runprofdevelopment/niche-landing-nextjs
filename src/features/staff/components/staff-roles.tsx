"use client";

import { ShieldCheck } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { Badge, Card, CardContent } from "@/shared/components";

import type { StaffDetails } from "../types";

type StaffRolesProps = {
  staff: StaffDetails;
};

function StaffRoles({ staff }: StaffRolesProps) {
  const t = useTranslations("staff");

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <span className="text-lg font-semibold text-foreground">{t("rolesInfoTitle")}</span>
        </div>

        {staff.roles.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {staff.roles.map((role) => (
                <Badge key={role.id} variant="secondary" className="w-fit">
                  {role.name}
                </Badge>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {t("roleAccessSummary", { count: staff.permissionsCount })}
            </span>
            {/* <div className="flex flex-wrap items-center gap-4">
              {staff.roles.map((role) => (
                <Button
                  key={role.id}
                  type="button"
                  variant="link"
                  className="h-auto w-fit p-0"
                  onClick={() => router.push(`/users/roles/${role.id}`)}
                >
                  {t("viewRoleDetails", { role: role.name })}
                </Button>
              ))}
            </div> */}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">{t("roleNone")}</span>
        )}
      </CardContent>
    </Card>
  );
}

export { StaffRoles };
