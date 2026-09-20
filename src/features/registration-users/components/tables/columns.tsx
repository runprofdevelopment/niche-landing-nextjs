"use client";
"use no memo";

import { useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  DataTableCell,
  DataTableColumnHeader,
} from "@/shared/components";

import { GUEST_TYPE_LABEL_KEYS } from "../../constants";
import { getInitials } from "../../graphql";
import { useRegistrationUsersPermissions } from "../../hooks";
import { RegistrationUserRowActions } from "../actions/registration-user-row-actions";

import type { RegistrationUser } from "../../types";
import type { ColumnDef } from "@/shared/components";

function useRegistrationUsersColumns(options?: {
  onMarkedAsOwner?: (user: RegistrationUser) => void;
}): ColumnDef<RegistrationUser, unknown>[] {
  const t = useTranslations("registrationUsers");
  const { canView, canUpdate } = useRegistrationUsersPermissions();
  const showActions = canView || canUpdate;
  const onMarkedAsOwner = options?.onMarkedAsOwner;

  return useMemo<ColumnDef<RegistrationUser, unknown>[]>(() => {
    const columns: ColumnDef<RegistrationUser, unknown>[] = [
      createSelectColumn<RegistrationUser>(),
      createAccessorColumn<RegistrationUser, string>("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnName")} />,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DataTableCell className="flex items-center gap-3 font-medium">
              <Avatar className="size-8 shrink-0">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span>{user.name}</span>
            </DataTableCell>
          );
        },
        meta: { label: t("columnName"), align: "start" },
      }),
      createAccessorColumn<RegistrationUser, string>("phoneNumber", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnPhone")} />,
        meta: { label: t("columnPhone"), align: "start" },
      }),
      createAccessorColumn<RegistrationUser, string>("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEmail")} />,
        meta: { label: t("columnEmail"), align: "start" },
      }),
      createDisplayColumn<RegistrationUser>("guestType", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnAccountType")} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{t(GUEST_TYPE_LABEL_KEYS[row.original.guestType])}</Badge>
        ),
        enableSorting: false,
        meta: { label: t("columnAccountType"), align: "start" },
      }),
      createAccessorColumn<RegistrationUser, string>("registeredAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnRegisteredAt")} />
        ),
        meta: { label: t("columnRegisteredAt"), align: "start" },
      }),
      createDisplayColumn<RegistrationUser>("createdAt", {
        header: t("filterRegisteredAt"),
        cell: () => null,
        enableHiding: false,
        enableSorting: false,
        meta: { label: t("filterRegisteredAt") },
      }),
    ];

    if (showActions) {
      columns.push(
        createDisplayColumn<RegistrationUser>("actions", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t("columnActions")} />
          ),
          cell: ({ row }) => (
            <RegistrationUserRowActions
              user={row.original}
              {...(onMarkedAsOwner ? { onMarkedAsOwner } : {})}
            />
          ),
          meta: { label: t("columnActions") },
        }),
      );
    }

    return columns;
  }, [onMarkedAsOwner, showActions, t]);
}

export { useRegistrationUsersColumns };
