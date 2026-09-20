"use client";

import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";
import { useUserMutations, type GenericStatus } from "@/shared/graphql";

const refetchQueries = ["UserList", "UserFind"];

export function useChangeStaffStatus() {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const { setUserStatus, updatingStatus } = useUserMutations({ refetchQueries });

  const changeStaffStatus = useCallback(
    async (id: string, status: GenericStatus) => {
      const payload = await setUserStatus(id, status);
      if (payload != null) {
        notify.success({
          title:
            status === "active"
              ? tCommon("entityActivatedMessage", { entity: t("entityName") })
              : tCommon("entityDeactivatedMessage", { entity: t("entityName") }),
        });
      }
      return payload;
    },
    [setUserStatus, t, tCommon],
  );

  return { changeStaffStatus, loading: updatingStatus };
}
