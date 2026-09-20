"use client";

import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { notify } from "@/shared/components";

import {
  GUEST_PROFILE_CHANGE_TYPE_MUTATION,
  type GuestProfileChangeTypeMutationData,
  type GuestProfileChangeTypeMutationVariables,
} from "../graphql";

import type { GuestType } from "../constants";

const refetchQueries = ["GuestList", "UserFind"];

export function useChangeGuestType() {
  const t = useTranslations("registrationUsers");
  const { handleError } = useErrorHandler();
  const [mutate, { loading }] = useMutation<
    GuestProfileChangeTypeMutationData,
    GuestProfileChangeTypeMutationVariables
  >(GUEST_PROFILE_CHANGE_TYPE_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const changeGuestType = useCallback(
    async (id: string, guestType: GuestType) => {
      try {
        const { data } = await mutate({
          variables: {
            guestProfileChangeTypeId: id,
            guestType,
          },
        });
        // Backend may return `true`, or omit a meaningful payload — treat no-throw as success
        // unless the field is explicitly `false`.
        if (data?.guestProfileChangeType === false) return false;

        notify.success({
          title: guestType === "owner" ? t("markAsOwnerSuccess") : t("markAsGuestSuccess"),
        });
        return true;
      } catch (error) {
        handleError(error, {
          context: { feature: "registrationUsers", action: "guestProfileChangeType" },
        });
        return false;
      }
    },
    [handleError, mutate, t],
  );

  return { changeGuestType, loading };
}
