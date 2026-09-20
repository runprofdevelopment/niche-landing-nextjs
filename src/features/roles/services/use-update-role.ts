"use client";

import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";

import {
  ROLE_UPDATE_MUTATION,
  type RoleUpdateMutationData,
  type RoleUpdateMutationVariables,
  type UpdateRoleInput,
} from "../graphql";

type UpdateRolePayload = UpdateRoleInput & { id: string };

type UpdateRoleOptions = {
  onDuplicateName?: () => void;
};

const refetchQueries = ["RoleList"];

export function useUpdateRole() {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [mutate, { loading }] = useMutation<RoleUpdateMutationData, RoleUpdateMutationVariables>(
    ROLE_UPDATE_MUTATION,
    { refetchQueries, awaitRefetchQueries: true },
  );

  const updateRole = useCallback(
    async (input: UpdateRolePayload, _options: UpdateRoleOptions = {}) => {
      const { id, ...data } = input;
      const result = await mutate({
        variables: { roleUpdateId: id, data },
      });
      const payload = result.data?.roleUpdate ?? null;
      if (payload) {
        notify.success({
          title: tCommon("entityUpdatedMessage", { entity: t("entityName") }),
        });
      }
      return payload;
    },
    [mutate, t, tCommon],
  );

  return { updateRole, loading };
}
