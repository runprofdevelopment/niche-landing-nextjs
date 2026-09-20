"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapContactUsFind } from "../mappers/contact-us.mapper";
import {
  CONTACT_US_FIND_QUERY,
  type ContactUsFindQueryData,
  type ContactUsFindQueryVariables,
} from "../queries/contact-us-find";

type UseContactUsQueryOptions = {
  id: string;
  skip?: boolean | undefined;
};

export function useContactUsQuery(options: UseContactUsQueryOptions) {
  const { id, skip = false } = options;

  const { data, loading, error, refetch, networkStatus } = useQuery<
    ContactUsFindQueryData,
    ContactUsFindQueryVariables
  >(CONTACT_US_FIND_QUERY, {
    variables: { contactUsFindId: id },
    skip: skip || !id,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const request = useMemo(
    () => (data?.contactUsFind ? mapContactUsFind(data.contactUsFind) : null),
    [data],
  );

  return {
    request,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
