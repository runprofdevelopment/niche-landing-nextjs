import { gql } from "@apollo/client";

export type CreateFrontDeskInput = {
  countryCode: string;
  email: string;
  fullName: string;
  phoneNumber: string;
};

export type FrontDeskCreateMutationData = {
  frontDeskCreate: {
    email: string;
  };
};

export const FRONT_DESK_CREATE_MUTATION = gql`
  mutation FrontDeskCreate($data: CreateFrontDeskInput!) {
    frontDeskCreate(data: $data) {
      email
    }
  }
`;
