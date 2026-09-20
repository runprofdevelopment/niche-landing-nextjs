import { gql } from "@apollo/client";

export type SaveEventInvitationInput = {
  accent: string;
  background: string;
  bodyFont: string;
  brideName: string;
  dateLine: string;
  eventId: string;
  footer: string;
  groomName: string;
  headingFont: string;
  html: string;
  language: string;
  layout: string;
  message: string;
  namesFontSize: number;
  saveAsReusable: boolean;
  templateId?: string | null;
  templateImageUrl?: string | null;
  templateName?: string | null;
  timeLine: string;
  title: string;
  venueLine: string;
};

export type EventInvitationSaveResult = {
  eventId: string;
  id: string;
};

export type EventInvitationSaveMutationData = {
  eventInvitationSave: EventInvitationSaveResult | null;
};

export type EventInvitationSaveMutationVariables = {
  data: SaveEventInvitationInput;
};

export const EVENT_INVITATION_SAVE_MUTATION = gql`
  mutation EventInvitationSave($data: SaveEventInvitationInput!) {
    eventInvitationSave(data: $data) {
      eventId
      id
    }
  }
`;
