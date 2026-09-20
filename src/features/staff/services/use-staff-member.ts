"use client";

import { useStaffUserFindQuery } from "../graphql";

type UseStaffMemberOptions = {
  id: string;
  skip?: boolean;
};

export function useStaffMember(options: UseStaffMemberOptions) {
  const { id, skip } = options;
  const { node, staffDetail, formInitialData, loading, error, refetch } = useStaffUserFindQuery({
    id,
    skip,
  });

  return {
    formInitialData,
    staffDetail,
    /** Effective permission keys from the user profile (union from backend). */
    permissionKeys: node?.permissions ?? [],
    roleIds: node?.roleIds ?? [],
    requestDetails: null,
    loading,
    error,
    refetch,
  };
}
