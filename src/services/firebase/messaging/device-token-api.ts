import { gql } from "@apollo/client";

import { apolloClient } from "@/lib/apollo/client";

const ADD_DEVICE_TOKEN_MUTATION = gql`
  mutation AddDeviceToken($token: String!) {
    addDeviceToken(token: $token)
  }
`;

const REMOVE_DEVICE_TOKEN_MUTATION = gql`
  mutation RemoveDeviceToken($token: String!) {
    removeDeviceToken(token: $token)
  }
`;

type AddDeviceTokenMutationData = {
  addDeviceToken: boolean;
};

type RemoveDeviceTokenMutationData = {
  removeDeviceToken: boolean;
};

/** Registers the FCM device token with the backend (authenticated). */
export async function addDeviceToken(token: string): Promise<boolean> {
  const { data } = await apolloClient.mutate<AddDeviceTokenMutationData>({
    mutation: ADD_DEVICE_TOKEN_MUTATION,
    variables: { token },
  });
  return Boolean(data?.addDeviceToken);
}

/** Unregisters the FCM device token from the backend (authenticated). */
export async function removeDeviceToken(token: string): Promise<boolean> {
  const { data } = await apolloClient.mutate<RemoveDeviceTokenMutationData>({
    mutation: REMOVE_DEVICE_TOKEN_MUTATION,
    variables: { token },
  });
  return Boolean(data?.removeDeviceToken);
}
