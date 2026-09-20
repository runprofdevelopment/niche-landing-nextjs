import { gql } from "@apollo/client";

export type AddDeviceTokenMutationData = {
  addDeviceToken: boolean;
};

export const ADD_DEVICE_TOKEN_MUTATION = gql`
  mutation AddDeviceToken($token: String!) {
    addDeviceToken(token: $token)
  }
`;

export type RemoveDeviceTokenMutationData = {
  removeDeviceToken: boolean;
};

export const REMOVE_DEVICE_TOKEN_MUTATION = gql`
  mutation RemoveDeviceToken($token: String!) {
    removeDeviceToken(token: $token)
  }
`;
