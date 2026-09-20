import { gql } from "@apollo/client";

import type { GuestType } from "../../constants";

export type GuestProfileChangeTypeMutationData = {
  guestProfileChangeType: boolean | null;
};

export type GuestProfileChangeTypeMutationVariables = {
  guestProfileChangeTypeId: string;
  guestType: GuestType;
};

export const GUEST_PROFILE_CHANGE_TYPE_MUTATION = gql`
  mutation GuestProfileChangeType($guestProfileChangeTypeId: ID!, $guestType: GuestTypeEnum!) {
    guestProfileChangeType(id: $guestProfileChangeTypeId, guestType: $guestType)
  }
`;
