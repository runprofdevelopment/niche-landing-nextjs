"use client";

import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";
import { useUserMutations } from "@/shared/graphql";

const refetchQueries = ["UserList", "UserFind"];

export function useDeleteStaff() {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const { destroyUser, destroying } = useUserMutations({ refetchQueries });

  const deleteStaff = useCallback(
    async (id: string) => {
      const payload = await destroyUser(id);
      if (payload) {
        notify.success({
          title: tCommon("entityDeletedMessage", { entity: t("entityName") }),
        });
        return { success: true as const, id: payload.id };
      }
      return null;
    },
    [destroyUser, t, tCommon],
  );

  return { deleteStaff, loading: destroying };
}
