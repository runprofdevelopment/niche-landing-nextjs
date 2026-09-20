"use client";

import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";

import {
  ROLE_CHANGE_STATUS_MUTATION,
  type RoleChangeStatusMutationData,
  type RoleChangeStatusMutationVariables,
  type RoleStatusEnum,
} from "../graphql";

const refetchQueries = ["RoleList"];

export function useChangeRoleStatus() {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [mutate, { loading }] = useMutation<
    RoleChangeStatusMutationData,
    RoleChangeStatusMutationVariables
  >(ROLE_CHANGE_STATUS_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  const changeRoleStatus = useCallback(
    async (id: string, status: RoleStatusEnum) => {
      const result = await mutate({
        variables: { roleChangeStatusId: id, status },
      });
      const payload = result.data?.roleChangeStatus ?? null;
      if (payload) {
        notify.success({
          title: tCommon("entityUpdatedMessage", { entity: t("entityName") }),
        });
      }
      return payload;
    },
    [mutate, t, tCommon],
  );

  return { changeRoleStatus, loading };
}
