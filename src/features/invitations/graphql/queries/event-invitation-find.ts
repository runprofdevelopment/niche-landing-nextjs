import { gql } from "@apollo/client";

export type EventInvitationTemplateNode = {
  id: string;
  name: string | null;
  language: string | null;
  layout: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  namesFontSize: number | null;
  accent: string | null;
  background: string | null;
  templateImageUrl: string | null;
  html: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
};

export type EventInvitationFindNode = {
  id: string;
  eventId: string;
  templateId: string | null;
  language: string | null;
  layout: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  namesFontSize: number | null;
  accent: string | null;
  background: string | null;
  templateImageUrl: string | null;
  brideName: string | null;
  groomName: string | null;
  title: string | null;
  message: string | null;
  dateLine: string | null;
  timeLine: string | null;
  venueLine: string | null;
  footer: string | null;
  html: string | null;
  event: {
    id: string;
    name: string | null;
  } | null;
  template: EventInvitationTemplateNode | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
};

export type EventInvitationFindQueryData = {
  eventInvitationFind: EventInvitationFindNode | null;
};

export type EventInvitationFindQueryVariables = {
  eventId: string;
};

export const EVENT_INVITATION_FIND_QUERY = gql`
  query EventInvitationFind($eventId: ID!) {
    eventInvitationFind(eventId: $eventId) {
      id
      eventId
      templateId
      language
      layout
      headingFont
      bodyFont
      namesFontSize
      accent
      background
      templateImageUrl
      brideName
      groomName
      title
      message
      dateLine
      timeLine
      venueLine
      footer
      html
      event {
        id
        name
      }
      template {
        id
        name
        language
        layout
        headingFont
        bodyFont
        namesFontSize
        accent
        background
        templateImageUrl
        html
        createdAt
        updatedAt
        createdBy
        updatedBy
      }
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;
