/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}": typeof types.CreateUserDocument,
    "query Me {\n  me {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}": typeof types.MeDocument,
    "query DashboardOverview {\n  dashboardOverview {\n    totalGuests\n    eventsThisWeek\n    upcomingEvents {\n      id\n      name\n      date\n      guestCount\n    }\n  }\n}": typeof types.DashboardOverviewDocument,
    "mutation BulkImportGuests($input: BulkImportGuestsInput!) {\n  bulkImportGuests(input: $input) {\n    message\n    importedCount\n    guests {\n      id\n      eventId\n      name\n      familyName\n      email\n      phone\n      gender\n      abayaLabel\n      code\n      rsvpStatus\n      groupId\n      seatId\n      tableId\n      checkedInAt\n      checkedOutAt\n    }\n    errors {\n      row\n      field\n      message\n    }\n  }\n}": typeof types.BulkImportGuestsDocument,
    "mutation CreateEvent($input: CreateEventInput!) {\n  createEvent(input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": typeof types.CreateEventDocument,
    "mutation CreateGuest($input: CreateGuestInput!) {\n  createGuest(input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}": typeof types.CreateGuestDocument,
    "mutation DeleteEvent($id: ID!) {\n  deleteEvent(id: $id)\n}": typeof types.DeleteEventDocument,
    "mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {\n  updateEvent(id: $id, input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": typeof types.UpdateEventDocument,
    "mutation UpdateGuest($id: ID!, $input: UpdateGuestInput!) {\n  updateGuest(id: $id, input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}": typeof types.UpdateGuestDocument,
    "query EventGuests($eventId: ID!) {\n  eventGuests(eventId: $eventId) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    hallId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}": typeof types.EventGuestsDocument,
    "query Event($id: ID!) {\n  event(id: $id) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": typeof types.EventDocument,
    "query Events($status: EventStatus) {\n  events(status: $status) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": typeof types.EventsDocument,
};
const documents: Documents = {
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}": types.CreateUserDocument,
    "query Me {\n  me {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}": types.MeDocument,
    "query DashboardOverview {\n  dashboardOverview {\n    totalGuests\n    eventsThisWeek\n    upcomingEvents {\n      id\n      name\n      date\n      guestCount\n    }\n  }\n}": types.DashboardOverviewDocument,
    "mutation BulkImportGuests($input: BulkImportGuestsInput!) {\n  bulkImportGuests(input: $input) {\n    message\n    importedCount\n    guests {\n      id\n      eventId\n      name\n      familyName\n      email\n      phone\n      gender\n      abayaLabel\n      code\n      rsvpStatus\n      groupId\n      seatId\n      tableId\n      checkedInAt\n      checkedOutAt\n    }\n    errors {\n      row\n      field\n      message\n    }\n  }\n}": types.BulkImportGuestsDocument,
    "mutation CreateEvent($input: CreateEventInput!) {\n  createEvent(input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": types.CreateEventDocument,
    "mutation CreateGuest($input: CreateGuestInput!) {\n  createGuest(input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}": types.CreateGuestDocument,
    "mutation DeleteEvent($id: ID!) {\n  deleteEvent(id: $id)\n}": types.DeleteEventDocument,
    "mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {\n  updateEvent(id: $id, input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": types.UpdateEventDocument,
    "mutation UpdateGuest($id: ID!, $input: UpdateGuestInput!) {\n  updateGuest(id: $id, input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}": types.UpdateGuestDocument,
    "query EventGuests($eventId: ID!) {\n  eventGuests(eventId: $eventId) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    hallId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}": types.EventGuestsDocument,
    "query Event($id: ID!) {\n  event(id: $id) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": types.EventDocument,
    "query Events($status: EventStatus) {\n  events(status: $status) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}": types.EventsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}"): (typeof documents)["mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}"): (typeof documents)["query Me {\n  me {\n    id\n    email\n    fullName\n    department\n    role\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query DashboardOverview {\n  dashboardOverview {\n    totalGuests\n    eventsThisWeek\n    upcomingEvents {\n      id\n      name\n      date\n      guestCount\n    }\n  }\n}"): (typeof documents)["query DashboardOverview {\n  dashboardOverview {\n    totalGuests\n    eventsThisWeek\n    upcomingEvents {\n      id\n      name\n      date\n      guestCount\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation BulkImportGuests($input: BulkImportGuestsInput!) {\n  bulkImportGuests(input: $input) {\n    message\n    importedCount\n    guests {\n      id\n      eventId\n      name\n      familyName\n      email\n      phone\n      gender\n      abayaLabel\n      code\n      rsvpStatus\n      groupId\n      seatId\n      tableId\n      checkedInAt\n      checkedOutAt\n    }\n    errors {\n      row\n      field\n      message\n    }\n  }\n}"): (typeof documents)["mutation BulkImportGuests($input: BulkImportGuestsInput!) {\n  bulkImportGuests(input: $input) {\n    message\n    importedCount\n    guests {\n      id\n      eventId\n      name\n      familyName\n      email\n      phone\n      gender\n      abayaLabel\n      code\n      rsvpStatus\n      groupId\n      seatId\n      tableId\n      checkedInAt\n      checkedOutAt\n    }\n    errors {\n      row\n      field\n      message\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateEvent($input: CreateEventInput!) {\n  createEvent(input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"): (typeof documents)["mutation CreateEvent($input: CreateEventInput!) {\n  createEvent(input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateGuest($input: CreateGuestInput!) {\n  createGuest(input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}"): (typeof documents)["mutation CreateGuest($input: CreateGuestInput!) {\n  createGuest(input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteEvent($id: ID!) {\n  deleteEvent(id: $id)\n}"): (typeof documents)["mutation DeleteEvent($id: ID!) {\n  deleteEvent(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {\n  updateEvent(id: $id, input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"): (typeof documents)["mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {\n  updateEvent(id: $id, input: $input) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateGuest($id: ID!, $input: UpdateGuestInput!) {\n  updateGuest(id: $id, input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}"): (typeof documents)["mutation UpdateGuest($id: ID!, $input: UpdateGuestInput!) {\n  updateGuest(id: $id, input: $input) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query EventGuests($eventId: ID!) {\n  eventGuests(eventId: $eventId) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    hallId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}"): (typeof documents)["query EventGuests($eventId: ID!) {\n  eventGuests(eventId: $eventId) {\n    id\n    eventId\n    name\n    familyName\n    email\n    phone\n    gender\n    abayaLabel\n    code\n    rsvpStatus\n    groupId\n    hallId\n    seatId\n    tableId\n    checkedInAt\n    checkedOutAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Event($id: ID!) {\n  event(id: $id) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"): (typeof documents)["query Event($id: ID!) {\n  event(id: $id) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Events($status: EventStatus) {\n  events(status: $status) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"): (typeof documents)["query Events($status: EventStatus) {\n  events(status: $status) {\n    id\n    name\n    brideName\n    groomName\n    customerName\n    createdBy\n    date\n    startTime\n    endTime\n    venueName\n    expectedGuests\n    hallCapacity\n    hallReference\n    address\n    googleMapsUrl\n    invitationCount\n    status\n    language\n    createdAt\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;