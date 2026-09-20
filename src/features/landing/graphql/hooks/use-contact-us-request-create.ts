"use client";

import { useMutation } from "@apollo/client";

import {
  CONTACT_US_REQUEST_CREATE_MUTATION,
  type ContactUsRequestCreateInput,
  type ContactUsRequestCreateMutationData,
  type ContactUsRequestCreateMutationVariables,
} from "../mutations/contact-us-request-create";

export function useContactUsRequestCreate() {
  const [mutate, state] = useMutation<
    ContactUsRequestCreateMutationData,
    ContactUsRequestCreateMutationVariables
  >(CONTACT_US_REQUEST_CREATE_MUTATION);

  return {
    creating: state.loading,
    createRequest: async (data: ContactUsRequestCreateInput) => {
      const result = await mutate({ variables: { data } });
      return result.data?.contactUsRequestCreate ?? null;
    },
  };
}
