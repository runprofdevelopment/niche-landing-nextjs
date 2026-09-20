import { gql } from "@apollo/client";

export type ContactUsFindNode = {
  id: string;
  customerName: string | null;
  email: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  eventType: string | null;
  date: string | null;
  time: string | null;
  message: string | null;
  status: string | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type ContactUsFindQueryData = {
  contactUsFind: ContactUsFindNode | null;
};

export type ContactUsFindQueryVariables = {
  contactUsFindId: string;
};

export const CONTACT_US_FIND_QUERY = gql`
  query ContactUsFind($contactUsFindId: ID!) {
    contactUsFind(id: $contactUsFindId) {
      id
      customerName
      email
      phoneNumber
      countryCode
      eventType
      date
      time
      message
      status
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
