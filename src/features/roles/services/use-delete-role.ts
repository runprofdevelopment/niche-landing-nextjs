"use client";

import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";

import {
  ROLE_DESTROY_MUTATION,
  type RoleDestroyMutationData,
  type RoleDestroyMutationVariables,
} from "../graphql";

const refetchQueries = ["RoleList"];

export function useDeleteRole() {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [mutate, { loading }] = useMutation<RoleDestroyMutationData, RoleDestroyMutationVariables>(
    ROLE_DESTROY_MUTATION,
    { refetchQueries, awaitRefetchQueries: true },
  );

  const deleteRole = useCallback(
    async (id: string) => {
      const result = await mutate({
        variables: { roleDestroyId: id },
      });
      const payload = result.data?.roleDestroy ?? null;
      if (payload) {
        notify.success({
          title: tCommon("entityDeletedMessage", { entity: t("entityName") }),
        });
        return { success: true as const, id: payload.id };
      }
      return null;
    },
    [mutate, t, tCommon],
  );

  return { deleteRole, loading };
}
