"use client";

import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";
import { useUserMutations } from "@/shared/graphql";
import { toApiDialCode } from "@/shared/utils/international-phone";

import type { UpdateUserInput, UserAvatarInput } from "@/shared/graphql/mutations/user-update";

export type UpdateStaffInput = {
  id: string;
  fullName?: string | undefined;
  email?: string | undefined;
  phoneNumber?: string | undefined;
  countryCode?: string | undefined;
  roleIds?: string[] | undefined;
  avatar?: UserAvatarInput | null | undefined;
};

const refetchQueries = ["UserList", "UserFind"];

export function useUpdateStaff() {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const { updateUser, updating } = useUserMutations({ refetchQueries });

  const updateStaff = useCallback(
    async (input: UpdateStaffInput) => {
      const data: UpdateUserInput = {
        ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : {}),
        ...(input.email !== undefined ? { email: input.email.trim() } : {}),
        ...(input.phoneNumber !== undefined ? { phoneNumber: input.phoneNumber.trim() } : {}),
        ...(input.countryCode !== undefined
          ? { countryCode: toApiDialCode(input.countryCode) }
          : {}),
        ...(input.roleIds !== undefined ? { roleIds: input.roleIds } : {}),
        ...(input.avatar !== undefined
          ? {
              avatar: input.avatar?.publicUrl
                ? {
                    id: input.avatar.id ?? "",
                    name: input.avatar.name ?? null,
                    publicUrl: input.avatar.publicUrl,
                  }
                : null,
            }
          : {}),
      };

      const payload = await updateUser(input.id, data);
      if (payload) {
        notify.success({
          title: tCommon("entityUpdatedMessage", { entity: t("entityName") }),
        });
      }
      return payload;
    },
    [t, tCommon, updateUser],
  );

  return { updateStaff, loading: updating };
}
