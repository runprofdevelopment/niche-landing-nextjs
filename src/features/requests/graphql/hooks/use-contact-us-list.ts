"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapContactUsListRow } from "../mappers/contact-us.mapper";
import {
  CONTACT_US_LIST_QUERY,
  hasContactUsListFilters,
  type ContactUsFilterInput,
  type ContactUsListQueryData,
  type ContactUsListQueryVariables,
  type ContactUsPaginationInput,
  type ContactUsSortInput,
} from "../queries/contact-us-list";

type UseContactUsListQueryOptions = {
  sort?: ContactUsSortInput[] | null | undefined;
  pagination?: ContactUsPaginationInput | null | undefined;
  filters?: ContactUsFilterInput | null | undefined;
  skip?: boolean | undefined;
};

export function useContactUsListQuery(options: UseContactUsListQueryOptions = {}) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<ContactUsListQueryVariables>(
    () => ({
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasContactUsListFilters(filters) ? { filters } : {}),
    }),
    [filters, pagination, sort],
  );

  const { data, loading, error, refetch, networkStatus } = useQuery<
    ContactUsListQueryData,
    ContactUsListQueryVariables
  >(CONTACT_US_LIST_QUERY, {
    variables,
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const requests = useMemo(
    () => (data?.contactUsList?.rows ?? []).map(mapContactUsListRow),
    [data],
  );

  const pageInfo = data?.contactUsList?.pageInfo ?? null;
  const totalCount = pageInfo?.totalCount ?? 0;
  const pageCount = Math.max(1, pageInfo?.totalPagesCount ?? 1);

  return {
    requests,
    pageInfo,
    totalCount,
    pageCount,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
