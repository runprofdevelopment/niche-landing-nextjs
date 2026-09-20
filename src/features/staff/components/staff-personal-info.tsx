"use client";

import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  DetailRow,
  Switch,
} from "@/shared/components";

import { useStaffPermissions } from "../hooks";
import { useChangeStaffStatus } from "../services";

import type { StaffDetails } from "../types";

type StaffPersonalInfoProps = {
  staff: StaffDetails;
};

function StaffPersonalInfo({ staff }: StaffPersonalInfoProps) {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const { canUpdate } = useStaffPermissions();
  const { changeStaffStatus, loading: statusLoading } = useChangeStaffStatus();
  const [statusOpen, setStatusOpen] = useState(false);

  const entity = t("entityName");
  const isActive = staff.isActive;

  const handleToggleStatus = async () => {
    const result = await changeStaffStatus(staff.id, isActive ? "inactive" : "active");
    if (result == null) return;
    setStatusOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("personalInfoTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-12">
            <div className="flex min-w-0 flex-col gap-4">
              <DetailRow label={t("fieldStaffId")} value={staff.employeeId} />
              <DetailRow label={t("fieldFullName")} value={staff.name} />
              <DetailRow label={t("fieldEmail")} value={staff.email} />
              <DetailRow label={t("fieldPhone")} value={staff.phoneNumber} />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <DetailRow label={t("fieldDateJoined")} value={staff.dateJoined} />
              <DetailRow label={t("fieldCreatedBy")} value={staff.createdBy} />
              <DetailRow
                label={t("fieldActiveStatus")}
                value={
                  <Switch
                    checked={isActive}
                    disabled={!canUpdate || statusLoading}
                    onCheckedChange={() => {
                      if (!canUpdate || statusLoading) return;
                      setStatusOpen(true);
                    }}
                  />
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {canUpdate ? (
        <ConfirmDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          tone={isActive ? "destructive" : "success"}
          title={
            isActive
              ? tCommon("confirmDeactivateTitle", { entity })
              : tCommon("confirmActivateTitle", { entity })
          }
          description={
            isActive
              ? tCommon("confirmDeactivateDescription", { entity })
              : tCommon("confirmActivateDescription", { entity })
          }
          cancelLabel={tCommon("cancel")}
          confirmLabel={isActive ? tCommon("deactivate") : tCommon("activate")}
          onConfirm={handleToggleStatus}
        />
      ) : null}
    </>
  );
}

export { StaffPersonalInfo };
