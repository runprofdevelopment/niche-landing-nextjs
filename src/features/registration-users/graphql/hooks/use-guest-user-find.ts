"use client";

import { useQuery } from "@apollo/client";

import { mapGuestUserToDetails } from "../mappers/guest-user.mapper";
import {
  GUEST_USER_FIND_QUERY,
  type GuestUserFindQueryData,
  type GuestUserFindQueryVariables,
} from "../queries/user-find";

type UseGuestUserFindQueryOptions = {
  id: string;
  skip?: boolean;
};

export function useGuestUserFindQuery(options: UseGuestUserFindQueryOptions) {
  const { id, skip = false } = options;

  const { data, loading, error, refetch } = useQuery<
    GuestUserFindQueryData,
    GuestUserFindQueryVariables
  >(GUEST_USER_FIND_QUERY, {
    variables: { userFindId: id },
    skip: skip || !id,
    fetchPolicy: "cache-and-network",
  });

  const node = data?.userFind ?? null;
  const details = node ? mapGuestUserToDetails(node) : null;

  return {
    node,
    details,
    loading,
    error,
    refetch,
  };
}
