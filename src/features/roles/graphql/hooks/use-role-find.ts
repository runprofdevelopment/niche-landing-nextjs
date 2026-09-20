"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapRoleFindNodeToDetails, mapRoleFindNodeToFormInitialData } from "../mappers/role.mapper";
import {
  ROLE_FIND_QUERY,
  type RoleFindQueryData,
  type RoleFindQueryVariables,
} from "../queries/role-find";

type UseRoleFindQueryOptions = {
  id: string;
  skip?: boolean | undefined;
};

/** Loads one role via `roleFind`. */
export function useRoleFindQuery(options: UseRoleFindQueryOptions) {
  const { id, skip = false } = options;

  const { data, loading, error, refetch, networkStatus } = useQuery<
    RoleFindQueryData,
    RoleFindQueryVariables
  >(ROLE_FIND_QUERY, {
    variables: { roleFindId: id },
    skip: skip || !id,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const node = data?.roleFind ?? null;
  const role = useMemo(() => (node ? mapRoleFindNodeToDetails(node) : null), [node]);
  const formInitialData = useMemo(
    () => (node ? mapRoleFindNodeToFormInitialData(node) : null),
    [node],
  );

  return {
    role,
    formInitialData,
    node,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
