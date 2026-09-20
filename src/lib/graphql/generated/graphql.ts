/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type BulkImportGuestsInput = {
  eventId: string | number;
  guests: Array<CreateGuestInput>;
};

export type CreateEventInput = {
  address?: string | null | undefined;
  brideName: string;
  createdBy?: EventCreatedBy | null | undefined;
  customerName?: string | null | undefined;
  date: string;
  endTime: string;
  expectedGuests: number;
  googleMapsUrl?: string | null | undefined;
  groomName: string;
  hallCapacity?: number | null | undefined;
  hallReference?: string | null | undefined;
  language: string;
  name: string;
  startTime: string;
  status?: EventStatus | null | undefined;
  venueName: string;
};

export type CreateGuestInput = {
  abayaLabel?: string | null | undefined;
  code?: string | null | undefined;
  email?: string | null | undefined;
  eventId: string | number;
  familyName?: string | null | undefined;
  gender?: GuestGender | null | undefined;
  groupId?: string | number | null | undefined;
  name: string;
  phone?: string | null | undefined;
  rsvpStatus?: GuestRsvpStatus | null | undefined;
};

export type CreateUserInput = {
  countryCode: string;
  department: string;
  email: string;
  fullName: string;
  phone: string;
};

export type EventCreatedBy =
  | 'APP'
  | 'OPERATIONAL';

export type EventStatus =
  | 'ACTIVE'
  | 'PAST'
  | 'UPCOMING';

export type GuestGender =
  | 'FEMALE'
  | 'MALE';

export type GuestRsvpStatus =
  | 'CONFIRMED'
  | 'MAYBE'
  | 'UNCONFIRMED';

export type UpdateEventInput = {
  address?: string | null | undefined;
  brideName?: string | null | undefined;
  customerName?: string | null | undefined;
  date?: string | null | undefined;
  endTime?: string | null | undefined;
  expectedGuests?: number | null | undefined;
  googleMapsUrl?: string | null | undefined;
  groomName?: string | null | undefined;
  hallCapacity?: number | null | undefined;
  hallReference?: string | null | undefined;
  invitationCount?: number | null | undefined;
  language?: string | null | undefined;
  name?: string | null | undefined;
  startTime?: string | null | undefined;
  status?: EventStatus | null | undefined;
  venueName?: string | null | undefined;
};

export type UpdateGuestInput = {
  abayaLabel?: string | null | undefined;
  code?: string | null | undefined;
  email?: string | null | undefined;
  familyName?: string | null | undefined;
  gender?: GuestGender | null | undefined;
  groupId?: string | number | null | undefined;
  name?: string | null | undefined;
  phone?: string | null | undefined;
  rsvpStatus?: GuestRsvpStatus | null | undefined;
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { createUser: { id: string, email: string, fullName: string | null, department: string | null, role: string | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, email: string, fullName: string | null, department: string | null, role: string | null } | null };

export type DashboardOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardOverviewQuery = { dashboardOverview: { totalGuests: number, eventsThisWeek: number, upcomingEvents: Array<{ id: string, name: string, date: string | null, guestCount: number }> } };

export type BulkImportGuestsMutationVariables = Exact<{
  input: BulkImportGuestsInput;
}>;


export type BulkImportGuestsMutation = { bulkImportGuests: { message: string, importedCount: number, guests: Array<{ id: string, eventId: string, name: string, familyName: string | null, email: string | null, phone: string | null, gender: GuestGender | null, abayaLabel: string | null, code: string | null, rsvpStatus: GuestRsvpStatus | null, groupId: string | null, seatId: string | null, tableId: string | null, checkedInAt: unknown, checkedOutAt: unknown }>, errors: Array<{ row: number | null, field: string | null, message: string }> } };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { createEvent: { id: string, name: string, brideName: string, groomName: string, customerName: string, createdBy: EventCreatedBy, date: string, startTime: string, endTime: string, venueName: string, expectedGuests: number, hallCapacity: number | null, hallReference: string | null, address: string | null, googleMapsUrl: string | null, invitationCount: number, status: EventStatus, language: string, createdAt: unknown } };

export type CreateGuestMutationVariables = Exact<{
  input: CreateGuestInput;
}>;


export type CreateGuestMutation = { createGuest: { id: string, eventId: string, name: string, familyName: string | null, email: string | null, phone: string | null, gender: GuestGender | null, abayaLabel: string | null, code: string | null, rsvpStatus: GuestRsvpStatus | null, groupId: string | null, seatId: string | null, tableId: string | null, checkedInAt: unknown, checkedOutAt: unknown } };

export type DeleteEventMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteEventMutation = { deleteEvent: boolean };

export type UpdateEventMutationVariables = Exact<{
  id: string | number;
  input: UpdateEventInput;
}>;


export type UpdateEventMutation = { updateEvent: { id: string, name: string, brideName: string, groomName: string, customerName: string, createdBy: EventCreatedBy, date: string, startTime: string, endTime: string, venueName: string, expectedGuests: number, hallCapacity: number | null, hallReference: string | null, address: string | null, googleMapsUrl: string | null, invitationCount: number, status: EventStatus, language: string, createdAt: unknown } };

export type UpdateGuestMutationVariables = Exact<{
  id: string | number;
  input: UpdateGuestInput;
}>;


export type UpdateGuestMutation = { updateGuest: { id: string, eventId: string, name: string, familyName: string | null, email: string | null, phone: string | null, gender: GuestGender | null, abayaLabel: string | null, code: string | null, rsvpStatus: GuestRsvpStatus | null, groupId: string | null, seatId: string | null, tableId: string | null, checkedInAt: unknown, checkedOutAt: unknown } };

export type EventGuestsQueryVariables = Exact<{
  eventId: string | number;
}>;


export type EventGuestsQuery = { eventGuests: Array<{ id: string, eventId: string, name: string, familyName: string | null, email: string | null, phone: string | null, gender: GuestGender | null, abayaLabel: string | null, code: string | null, rsvpStatus: GuestRsvpStatus | null, groupId: string | null, hallId: string | null, seatId: string | null, tableId: string | null, checkedInAt: unknown, checkedOutAt: unknown }> };

export type EventQueryVariables = Exact<{
  id: string | number;
}>;


export type EventQuery = { event: { id: string, name: string, brideName: string, groomName: string, customerName: string, createdBy: EventCreatedBy, date: string, startTime: string, endTime: string, venueName: string, expectedGuests: number, hallCapacity: number | null, hallReference: string | null, address: string | null, googleMapsUrl: string | null, invitationCount: number, status: EventStatus, language: string, createdAt: unknown } | null };

export type EventsQueryVariables = Exact<{
  status?: EventStatus | null | undefined;
}>;


export type EventsQuery = { events: Array<{ id: string, name: string, brideName: string, groomName: string, customerName: string, createdBy: EventCreatedBy, date: string, startTime: string, endTime: string, venueName: string, expectedGuests: number, hallCapacity: number | null, hallReference: string | null, address: string | null, googleMapsUrl: string | null, invitationCount: number, status: EventStatus, language: string, createdAt: unknown }> };


export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"department"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"department"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const DashboardOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalGuests"}},{"kind":"Field","name":{"kind":"Name","value":"eventsThisWeek"}},{"kind":"Field","name":{"kind":"Name","value":"upcomingEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"guestCount"}}]}}]}}]}}]} as unknown as DocumentNode<DashboardOverviewQuery, DashboardOverviewQueryVariables>;
export const BulkImportGuestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BulkImportGuests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkImportGuestsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkImportGuests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"importedCount"}},{"kind":"Field","name":{"kind":"Name","value":"guests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"familyName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"abayaLabel"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpStatus"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"seatId"}},{"kind":"Field","name":{"kind":"Name","value":"tableId"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkedOutAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"row"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<BulkImportGuestsMutation, BulkImportGuestsMutationVariables>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brideName"}},{"kind":"Field","name":{"kind":"Name","value":"groomName"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"expectedGuests"}},{"kind":"Field","name":{"kind":"Name","value":"hallCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"hallReference"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"googleMapsUrl"}},{"kind":"Field","name":{"kind":"Name","value":"invitationCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const CreateGuestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGuest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGuestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGuest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"familyName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"abayaLabel"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpStatus"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"seatId"}},{"kind":"Field","name":{"kind":"Name","value":"tableId"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkedOutAt"}}]}}]}}]} as unknown as DocumentNode<CreateGuestMutation, CreateGuestMutationVariables>;
export const DeleteEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteEventMutation, DeleteEventMutationVariables>;
export const UpdateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brideName"}},{"kind":"Field","name":{"kind":"Name","value":"groomName"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"expectedGuests"}},{"kind":"Field","name":{"kind":"Name","value":"hallCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"hallReference"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"googleMapsUrl"}},{"kind":"Field","name":{"kind":"Name","value":"invitationCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UpdateEventMutation, UpdateEventMutationVariables>;
export const UpdateGuestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateGuest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateGuestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateGuest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"familyName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"abayaLabel"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpStatus"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"seatId"}},{"kind":"Field","name":{"kind":"Name","value":"tableId"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkedOutAt"}}]}}]}}]} as unknown as DocumentNode<UpdateGuestMutation, UpdateGuestMutationVariables>;
export const EventGuestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventGuests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventGuests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"familyName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"abayaLabel"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpStatus"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"hallId"}},{"kind":"Field","name":{"kind":"Name","value":"seatId"}},{"kind":"Field","name":{"kind":"Name","value":"tableId"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}},{"kind":"Field","name":{"kind":"Name","value":"checkedOutAt"}}]}}]}}]} as unknown as DocumentNode<EventGuestsQuery, EventGuestsQueryVariables>;
export const EventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Event"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brideName"}},{"kind":"Field","name":{"kind":"Name","value":"groomName"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"expectedGuests"}},{"kind":"Field","name":{"kind":"Name","value":"hallCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"hallReference"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"googleMapsUrl"}},{"kind":"Field","name":{"kind":"Name","value":"invitationCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<EventQuery, EventQueryVariables>;
export const EventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Events"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brideName"}},{"kind":"Field","name":{"kind":"Name","value":"groomName"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"expectedGuests"}},{"kind":"Field","name":{"kind":"Name","value":"hallCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"hallReference"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"googleMapsUrl"}},{"kind":"Field","name":{"kind":"Name","value":"invitationCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<EventsQuery, EventsQueryVariables>;