import { gql } from "@apollo/client";

export type ContactUsRequestCreateInput = {
  countryCode: string;
  customerName: string;
  date: string;
  email: string;
  eventType: string;
  /** Required by API when eventType is `other` */
  otherEventType?: string | null;
  message: string;
  phoneNumber: string;
  time: string;
};

export type ContactUsRequestCreateMutationData = {
  contactUsRequestCreate: {
    id: string;
    email: string;
  } | null;
};

export type ContactUsRequestCreateMutationVariables = {
  data: ContactUsRequestCreateInput;
};

export const CONTACT_US_REQUEST_CREATE_MUTATION = gql`
  mutation ContactUsRequestCreate($data: ContactUsRequestCreateInput!) {
    contactUsRequestCreate(data: $data) {
      id
      email
    }
  }
`;
