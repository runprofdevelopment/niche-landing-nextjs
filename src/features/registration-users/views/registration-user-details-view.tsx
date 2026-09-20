"use client";
"use no memo";

import { UserRound } from "lucide-react";
import { useState } from "react";

import { REGISTRATION_USERS_PERMISSIONS } from "@/constants/permissions";
import { CreateEventDialog } from "@/features/events/components/dialogs/CreateEventDialog";
import { useTranslations } from "@/hooks/useTranslations";
import { Badge, EmptyState, PageHeader, PermissionGate } from "@/shared/components";
import { Button } from "@/shared/components/ui/button";

import { ChangeGuestTypeDialog } from "../components/dialogs/change-guest-type-dialog";
import { RegistrationUserInfo } from "../components/registration-user-info";
import { GUEST_TYPE_LABEL_KEYS } from "../constants";
import { useRegistrationUsersPermissions } from "../hooks";
import { useChangeGuestType, useRegistrationUser } from "../services";

type RegistrationUserDetailsViewProps = {
  userId: string;
};

function RegistrationUserDetailsView({ userId }: RegistrationUserDetailsViewProps) {
  const t = useTranslations("registrationUsers");
  const { canUpdate } = useRegistrationUsersPermissions();
  const { user, loading } = useRegistrationUser({ id: userId });
  const [changeTypeOpen, setChangeTypeOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const { changeGuestType, loading: changing } = useChangeGuestType();

  if (loading && !user) {
    return null;
  }

  if (!user) {
    return <EmptyState icon={<UserRound />} title={t("detailsTitle")} />;
  }

  const nextType = user.guestType === "guest" ? "owner" : "guest";

  const handleConfirm = async () => {
    const ok = await changeGuestType(user.id, nextType);
    if (!ok) return;
    setChangeTypeOpen(false);
    if (nextType === "owner") {
      setCreateEventOpen(true);
    }
  };

  return (
    <PermissionGate permission={REGISTRATION_USERS_PERMISSIONS.view}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={
            <span className="flex flex-wrap items-center gap-3">
              {user.name}
              <Badge variant="secondary">{t(GUEST_TYPE_LABEL_KEYS[user.guestType])}</Badge>
            </span>
          }
          actions={
            canUpdate ? (
              <Button type="button" onClick={() => setChangeTypeOpen(true)}>
                {nextType === "owner" ? t("actionMarkAsOwner") : t("actionMarkAsGuest")}
              </Button>
            ) : null
          }
        />

        <RegistrationUserInfo user={user} />

        {canUpdate ? (
          <ChangeGuestTypeDialog
            open={changeTypeOpen}
            onOpenChange={setChangeTypeOpen}
            userName={user.name}
            nextType={nextType}
            loading={changing}
            onConfirm={handleConfirm}
          />
        ) : null}

        <CreateEventDialog
          open={createEventOpen}
          onOpenChange={setCreateEventOpen}
          defaultOwnerId={user.id}
          defaultOwnerLabel={user.name}
        />
      </div>
    </PermissionGate>
  );
}

export { RegistrationUserDetailsView };
