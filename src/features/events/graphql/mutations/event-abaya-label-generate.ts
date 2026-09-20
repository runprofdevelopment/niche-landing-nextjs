import { gql } from "@apollo/client";

export type GenerateEventAbayaLabelInput = {
  eventId: string;
  prefix: string;
  suffix?: string | null;
  from: number;
  to: number;
};

export type EventAbayaLabelGenerateMutationData = {
  eventAbayaLabelGenerate: { id: string } | null;
};

export type EventAbayaLabelGenerateMutationVariables = {
  data: GenerateEventAbayaLabelInput;
};

export const EVENT_ABAYA_LABEL_GENERATE_MUTATION = gql`
  mutation EventAbayaLabelGenerate($data: GenerateEventAbayaLabelInput!) {
    eventAbayaLabelGenerate(data: $data) {
      id
    }
  }
`;
