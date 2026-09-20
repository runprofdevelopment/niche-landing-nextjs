import { gql } from "@apollo/client";

export type InvitationTemplateDestroyMutationData = {
  invitationTemplateDestroy: { id: string } | null;
};

export type InvitationTemplateDestroyMutationVariables = {
  invitationTemplateDestroyId: string;
};

export const INVITATION_TEMPLATE_DESTROY_MUTATION = gql`
  mutation InvitationTemplateDestroy($invitationTemplateDestroyId: ID!) {
    invitationTemplateDestroy(id: $invitationTemplateDestroyId) {
      id
    }
  }
`;
