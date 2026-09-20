"use client";

import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { notify } from "@/shared/components";
import { toApiDialCode } from "@/shared/utils/international-phone";

import {
  STAFF_USER_CREATE_MUTATION,
  type CreateStaffUserInput,
  type StaffUserCreateMutationData,
  type StaffUserCreateMutationVariables,
} from "../graphql";

import type { UserAvatarInput } from "@/shared/graphql/mutations/user-update";

export type CreateStaffInput = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  roleIds: string[];
  avatar?: UserAvatarInput | null;
};

const refetchQueries = ["UserList"];

export function useCreateStaff() {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const [mutate, { loading }] = useMutation<
    StaffUserCreateMutationData,
    StaffUserCreateMutationVariables
  >(STAFF_USER_CREATE_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  const createStaff = useCallback(
    async (input: CreateStaffInput) => {
      const data: CreateStaffUserInput = {
        email: input.email.trim(),
        fullName: input.name.trim(),
        phoneNumber: input.phone.trim(),
        countryCode: toApiDialCode(input.countryCode),
        roleIds: input.roleIds,
        ...(input.avatar?.publicUrl
          ? {
              avatar: {
                id: input.avatar.id ?? "",
                name: input.avatar.name ?? null,
                publicUrl: input.avatar.publicUrl,
              },
            }
          : {}),
      };

      const result = await mutate({ variables: { data } });
      const payload = result.data?.userCreate ?? null;
      if (payload) {
        notify.success({
          title: tCommon("entityCreatedMessage", { entity: t("entityName") }),
        });
      }
      return payload;
    },
    [mutate, t, tCommon],
  );

  return { createStaff, loading };
}
