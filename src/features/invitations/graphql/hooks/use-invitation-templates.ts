"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapInvitationTemplateListRow } from "../mappers/invitation.mapper";
import {
  INVITATION_TEMPLATE_DESTROY_MUTATION,
  type InvitationTemplateDestroyMutationData,
  type InvitationTemplateDestroyMutationVariables,
} from "../mutations/invitation-template-destroy";
import {
  INVITATION_TEMPLATE_LIST_QUERY,
  hasInvitationTemplateListFilters,
  type InvitationTemplateFilterInput,
  type InvitationTemplateListQueryData,
  type InvitationTemplateListQueryVariables,
  type InvitationTemplatePaginationInput,
  type InvitationTemplateSortInput,
} from "../queries/invitation-template-list";

const refetchQueries = ["InvitationTemplateList", "EventInvitationFind"];

export function useInvitationTemplateListQuery(
  options: {
    sort?: InvitationTemplateSortInput[] | null;
    pagination?: InvitationTemplatePaginationInput | null;
    filters?: InvitationTemplateFilterInput | null;
    skip?: boolean;
  } = {},
) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<InvitationTemplateListQueryVariables>(
    () => ({
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasInvitationTemplateListFilters(filters) ? { filters } : {}),
    }),
    [filters, pagination, sort],
  );

  const { data, loading, error, refetch } = useQuery<
    InvitationTemplateListQueryData,
    InvitationTemplateListQueryVariables
  >(INVITATION_TEMPLATE_LIST_QUERY, {
    variables,
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const rows = useMemo(
    () => (data?.invitationTemplateList?.rows ?? []).map(mapInvitationTemplateListRow),
    [data],
  );
  const pageInfo = data?.invitationTemplateList?.pageInfo ?? null;

  return {
    rows,
    pageInfo,
    totalCount: pageInfo?.totalCount ?? 0,
    pageCount: Math.max(1, pageInfo?.totalPagesCount ?? 1),
    loading,
    error,
    refetch,
  };
}

export function useInvitationTemplateMutations() {
  const [destroyMutation, destroyState] = useMutation<
    InvitationTemplateDestroyMutationData,
    InvitationTemplateDestroyMutationVariables
  >(INVITATION_TEMPLATE_DESTROY_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  return {
    destroyInvitationTemplate: async (id: string) => {
      const result = await destroyMutation({
        variables: { invitationTemplateDestroyId: id },
      });
      const row = result.data?.invitationTemplateDestroy;
      if (!row?.id) throw new Error("invitationTemplateDestroy returned no data");
      return row;
    },
    destroying: destroyState.loading,
  };
}
