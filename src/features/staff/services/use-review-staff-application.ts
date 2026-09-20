"use client";

import { useCallback } from "react";

import { useUserMutations } from "@/shared/graphql";

import type { ReviewStaffApplicationInput } from "./graphql-types";

const refetchQueries = ["UserList", "UserFind"];

/**
 * Pending approval assigns roles via `userAssignRole` (moves the user out of pending).
 */
export function useReviewStaffApplication() {
  const { assignUserRoles, assigningRole } = useUserMutations({
    refetchQueries,
  });

  const reviewStaffApplication = useCallback(
    async (input: ReviewStaffApplicationInput) => {
      if (input.decision !== "ACCEPTED") return null;
      const roleIds = input.roleIds ?? [];
      if (roleIds.length === 0) return null;
      return assignUserRoles(input.staff_id, roleIds);
    },
    [assignUserRoles],
  );

  return { reviewStaffApplication, loading: assigningRole };
}
