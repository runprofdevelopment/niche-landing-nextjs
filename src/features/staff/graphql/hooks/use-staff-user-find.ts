"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapStaffUserToDetails, mapStaffUserToFormInitialData } from "../mappers/staff-user.mapper";
import {
  STAFF_USER_FIND_QUERY,
  type StaffUserFindQueryData,
  type StaffUserFindQueryVariables,
} from "../queries/user-find";

type UseStaffUserFindQueryOptions = {
  id: string;
  skip?: boolean | undefined;
};

export function useStaffUserFindQuery(options: UseStaffUserFindQueryOptions) {
  const { id, skip = false } = options;

  const { data, loading, error, refetch, networkStatus } = useQuery<
    StaffUserFindQueryData,
    StaffUserFindQueryVariables
  >(STAFF_USER_FIND_QUERY, {
    variables: { userFindId: id },
    skip: skip || !id,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const node = data?.userFind ?? null;
  const staffDetail = useMemo(() => (node ? mapStaffUserToDetails(node) : null), [node]);
  const formInitialData = useMemo(
    () => (node ? mapStaffUserToFormInitialData(node) : null),
    [node],
  );

  return {
    node,
    staffDetail,
    formInitialData,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
