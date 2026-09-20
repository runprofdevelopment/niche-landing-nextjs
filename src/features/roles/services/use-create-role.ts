"use client";

import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";

import {
  ROLE_CREATE_MUTATION,
  type CreateRoleInput,
  type RoleCreateMutationData,
  type RoleCreateMutationVariables,
} from "../graphql";

type CreateRoleOptions = {
  onDuplicateName?: () => void;
};

const refetchQueries = ["RoleList"];

export function useCreateRole() {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [mutate, { loading }] = useMutation<RoleCreateMutationData, RoleCreateMutationVariables>(
    ROLE_CREATE_MUTATION,
    { refetchQueries, awaitRefetchQueries: true },
  );

  const createRole = useCallback(
    async (input: CreateRoleInput, _options: CreateRoleOptions = {}) => {
      const result = await mutate({ variables: { data: input } });
      const payload = result.data?.roleCreate ?? null;
      if (payload) {
        notify.success({
          title: tCommon("entityCreatedMessage", { entity: t("entityName") }),
        });
      }
      return payload;
    },
    [mutate, t, tCommon],
  );

  return { createRole, loading };
}
