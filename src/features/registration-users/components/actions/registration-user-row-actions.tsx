"use client";

import { Crown, Eye, UserRound } from "lucide-react";
import { useState } from "react";

import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  TableRowActionsTrigger,
} from "@/shared/components";

import { useRegistrationUsersPermissions } from "../../hooks";
import { useChangeGuestType } from "../../services";
import { ChangeGuestTypeDialog } from "../dialogs/change-guest-type-dialog";

import type { RegistrationUser } from "../../types";

type RegistrationUserRowActionsProps = {
  user: RegistrationUser;
  onMarkedAsOwner?: (user: RegistrationUser) => void;
};

function RegistrationUserRowActions({ user, onMarkedAsOwner }: RegistrationUserRowActionsProps) {
  const t = useTranslations("registrationUsers");
  const router = useRouter();
  const { canView, canUpdate } = useRegistrationUsersPermissions();
  const [changeTypeOpen, setChangeTypeOpen] = useState(false);
  const { changeGuestType, loading } = useChangeGuestType();

  const nextType = user.guestType === "guest" ? "owner" : "guest";
  const hasAnyAction = canView || canUpdate;

  const handleConfirm = async () => {
    const ok = await changeGuestType(user.id, nextType);
    if (!ok) return;
    setChangeTypeOpen(false);
    if (nextType === "owner") {
      onMarkedAsOwner?.(user);
    }
  };

  if (!hasAnyAction) return null;

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel")} loading={loading} />
        <DropdownMenuContent align="end">
          {canView ? (
            <DropdownMenuItem onClick={() => router.push(routes.usersAllMember(user.id))}>
              <Eye />
              {t("actionViewDetails")}
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuItem onClick={() => setChangeTypeOpen(true)}>
              {nextType === "owner" ? <Crown /> : <UserRound />}
              {nextType === "owner" ? t("actionMarkAsOwner") : t("actionMarkAsGuest")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate ? (
        <ChangeGuestTypeDialog
          open={changeTypeOpen}
          onOpenChange={setChangeTypeOpen}
          userName={user.name}
          nextType={nextType}
          loading={loading}
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  );
}

export { RegistrationUserRowActions };
