import { gql } from "@apollo/client";

export type StaffRegisterInput = {
  countryCode: string;
  department: string;
  email: string;
  fullName: string;
  phoneNumber: string;
};

export type StaffRegisterResult = {
  id: string;
  fullName: string | null;
};

export type StaffRegisterMutationData = {
  staffRegister: StaffRegisterResult;
};

export const STAFF_REGISTER_MUTATION = gql`
  mutation StaffRegister($data: StaffRegisterInput!) {
    staffRegister(data: $data) {
      id
      fullName
    }
  }
`;
