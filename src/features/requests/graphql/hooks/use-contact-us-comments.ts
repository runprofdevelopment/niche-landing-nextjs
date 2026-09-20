"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapContactUsComment } from "../mappers/contact-us.mapper";
import {
  CONTACT_US_COMMENT_LIST_QUERY,
  type ContactUsCommentListQueryData,
  type ContactUsCommentListQueryVariables,
} from "../queries/contact-us-comment-list";

type UseContactUsCommentsQueryOptions = {
  contactUsId: string;
  skip?: boolean | undefined;
};

export function useContactUsCommentsQuery(options: UseContactUsCommentsQueryOptions) {
  const { contactUsId, skip = false } = options;

  const { data, loading, error, refetch, networkStatus } = useQuery<
    ContactUsCommentListQueryData,
    ContactUsCommentListQueryVariables
  >(CONTACT_US_COMMENT_LIST_QUERY, {
    variables: { contactUsId },
    skip: skip || !contactUsId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const comments = useMemo(
    () => (data?.contactUsCommentList ?? []).map(mapContactUsComment),
    [data],
  );

  return {
    comments,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
