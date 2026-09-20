"use client";

import { useMutation } from "@apollo/client";

import { toFrontDeskProfileInput } from "../mappers/member.mapper";
import {
  FRONT_DESK_APPROVE_MUTATION,
  type FrontDeskApproveMutationData,
  type FrontDeskApproveMutationVariables,
} from "../mutations/front-desk-approve";
import {
  FRONT_DESK_CREATE_MUTATION,
  type FrontDeskCreateMutationData,
} from "../mutations/front-desk-create";
import {
  FRONT_DESK_REJECT_MUTATION,
  type FrontDeskRejectMutationData,
  type FrontDeskRejectMutationVariables,
} from "../mutations/front-desk-reject";

const refetchQueries = ["FrontDeskList"];

export function useFrontDeskMutations() {
  const [createMutation, createState] = useMutation<FrontDeskCreateMutationData>(
    FRONT_DESK_CREATE_MUTATION,
    { refetchQueries, awaitRefetchQueries: true },
  );
  const [approveMutation, approveState] = useMutation<
    FrontDeskApproveMutationData,
    FrontDeskApproveMutationVariables
  >(FRONT_DESK_APPROVE_MUTATION, { refetchQueries, awaitRefetchQueries: true });
  const [rejectMutation, rejectState] = useMutation<
    FrontDeskRejectMutationData,
    FrontDeskRejectMutationVariables
  >(FRONT_DESK_REJECT_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  return {
    creating: createState.loading,
    approving: approveState.loading,
    rejecting: rejectState.loading,
    createFrontDesk: async (values: {
      name: string;
      email: string;
      countryCode: string;
      phone: string;
    }) => {
      const result = await createMutation({
        variables: { data: toFrontDeskProfileInput(values) },
      });
      return result.data?.frontDeskCreate ?? null;
    },
    approveFrontDesk: async (id: string) => {
      const result = await approveMutation({ variables: { frontDeskApproveId: id } });
      return result.data?.frontDeskApprove ?? null;
    },
    rejectFrontDesk: async (id: string, reason: string) => {
      const result = await rejectMutation({
        variables: { frontDeskRejectId: id, reason: reason.trim() },
      });
      return result.data?.frontDeskReject ?? null;
    },
  };
}
