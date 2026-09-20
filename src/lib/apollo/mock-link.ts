"use client";

import { ApolloLink, Observable } from "@apollo/client";
import { print } from "graphql";

import { mockDb } from "@/lib/graphql/mocks/db";

import type { FetchResult, Operation } from "@apollo/client";

type MockHandler = (variables: Record<string, unknown>) => FetchResult["data"];

const handlers: Record<string, MockHandler> = {
  Me() {
    return { me: mockDb.getMe() };
  },
  AuthMe() {
    return { authMe: mockDb.getAuthMe() };
  },
  CreateUser(variables) {
    const input = variables["input"] as {
      fullName: string;
      email: string;
      countryCode: string;
      phone: string;
      department: string;
    };
    return { createUser: mockDb.createUser(input) };
  },
  StaffRegister(variables) {
    const data = variables["data"] as {
      fullName: string;
      email: string;
      countryCode: string;
      phoneNumber: string;
      department: string;
    };
    const user = mockDb.createUser({
      fullName: data.fullName,
      email: data.email,
      countryCode: data.countryCode,
      phone: data.phoneNumber,
      department: data.department,
    });
    return { staffRegister: { id: user.id, fullName: user.fullName } };
  },
  PasswordReset() {
    return { passwordReset: true };
  },
  VerifyEmail() {
    return { verifyEmail: true };
  },
  ResendVerificationCode() {
    return { resendVerificationCode: true };
  },
  AddDeviceToken() {
    return { addDeviceToken: true };
  },
  RemoveDeviceToken() {
    return { removeDeviceToken: true };
  },
  Events(variables) {
    const status = variables["status"] as "ACTIVE" | "UPCOMING" | "PAST" | null | undefined;
    return { events: mockDb.listEvents(status ?? undefined) };
  },
  EventList(variables) {
    const args: Parameters<typeof mockDb.eventList>[0] = {};
    if (variables["sort"] != null) {
      args.sort = variables["sort"] as NonNullable<Parameters<typeof mockDb.eventList>[0]["sort"]>;
    }
    if (variables["pagination"] != null) {
      args.pagination = variables["pagination"] as NonNullable<
        Parameters<typeof mockDb.eventList>[0]["pagination"]
      >;
    }
    if (variables["filters"] != null) {
      args.filters = variables["filters"] as NonNullable<
        Parameters<typeof mockDb.eventList>[0]["filters"]
      >;
    }
    return { eventList: mockDb.eventList(args) };
  },
  Event(variables) {
    return { event: mockDb.getEvent(String(variables["id"])) };
  },
  EventFind(variables) {
    const eventId = String(variables["eventId"] ?? variables["eventFindId"] ?? "");
    return {
      eventFind: mockDb.eventFind(eventId),
      eventSetupProgressFind: mockDb.eventSetupProgressFind(eventId),
      eventStatsFind: mockDb.eventStatsFind(eventId),
    };
  },
  CreateEvent(variables) {
    const input = variables["input"] as Parameters<typeof mockDb.createEvent>[0];
    return { createEvent: mockDb.createEvent(input) };
  },
  EventCreate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventCreate>[0];
    return { eventCreate: mockDb.eventCreate(data) };
  },
  EventTypeEnum() {
    return { eventTypeEnum: mockDb.eventTypeEnum() };
  },
  ContactUsRequestCreate(variables) {
    const data = variables["data"] as {
      countryCode: string;
      customerName: string;
      date: string;
      email: string;
      eventType: string;
      message: string;
      phoneNumber: string;
      time: string;
    };
    return {
      contactUsRequestCreate: {
        id: `contact-${Date.now()}`,
        email: data.email,
      },
    };
  },
  UpdateEvent(variables) {
    const input = variables["input"] as Parameters<typeof mockDb.updateEvent>[1];
    return { updateEvent: mockDb.updateEvent(String(variables["id"]), input) };
  },
  EventUpdate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventUpdate>[1];
    return {
      eventUpdate: mockDb.eventUpdate(String(variables["eventUpdateId"]), data),
    };
  },
  EventHallList(variables) {
    return { eventHallList: mockDb.eventHallList(String(variables["eventId"])) };
  },
  EventHallFind(variables) {
    return { eventHallFind: mockDb.eventHallFind(String(variables["eventHallFindId"])) };
  },
  EventHallCreate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventHallCreate>[0];
    return { eventHallCreate: mockDb.eventHallCreate(data) };
  },
  EventHallUpdate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventHallUpdate>[1];
    return {
      eventHallUpdate: mockDb.eventHallUpdate(String(variables["eventHallUpdateId"]), data),
    };
  },
  EventHallObjectList(variables) {
    return {
      eventHallObjectList: mockDb.eventHallObjectList(
        String(variables["eventId"]),
        String(variables["eventHallId"]),
      ),
    };
  },
  EventHallObjectSaveAll(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventHallObjectSaveAll>[0];
    return { eventHallObjectSaveAll: mockDb.eventHallObjectSaveAll(data) };
  },
  EventHallObjectDestroy(variables) {
    return {
      eventHallObjectDestroy: mockDb.eventHallObjectDestroy(
        String(variables["eventHallObjectDestroyId"]),
      ),
    };
  },
  EventSeatSaveAll(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventSeatSaveAll>[0];
    return { eventSeatSaveAll: mockDb.eventSeatSaveAll(data) };
  },
  EventSeatUnassign(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventSeatUnassign>[0];
    return { eventSeatUnassign: mockDb.eventSeatUnassign(data) };
  },
  EventTableRoster(variables) {
    return { eventTableRoster: mockDb.eventTableRoster(String(variables["tableId"])) };
  },
  EventGuestSeatMapList(variables) {
    return {
      eventGuestSeatMapList: mockDb.eventGuestSeatMapList(String(variables["eventId"])),
    };
  },
  EventDestroy(variables) {
    return {
      eventDestroy: mockDb.eventDestroy(
        String(variables["eventDestroyId"] ?? variables["id"] ?? ""),
      ),
    };
  },
  DeleteEvent(variables) {
    return {
      eventDestroy: mockDb.eventDestroy(String(variables["id"] ?? "")),
    };
  },
  EventGuests(variables) {
    return { eventGuests: mockDb.listGuests(String(variables["eventId"])) };
  },
  EventGuestList(variables) {
    const args: Parameters<typeof mockDb.eventGuestList>[0] = {
      eventId: String(variables["eventId"]),
    };
    if (variables["sort"] != null) {
      args.sort = variables["sort"] as NonNullable<
        Parameters<typeof mockDb.eventGuestList>[0]["sort"]
      >;
    }
    if (variables["pagination"] != null) {
      args.pagination = variables["pagination"] as NonNullable<
        Parameters<typeof mockDb.eventGuestList>[0]["pagination"]
      >;
    }
    if (variables["filters"] != null) {
      args.filters = variables["filters"] as NonNullable<
        Parameters<typeof mockDb.eventGuestList>[0]["filters"]
      >;
    }
    return { eventGuestList: mockDb.eventGuestList(args) };
  },
  EventGuestCreate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventGuestCreate>[0];
    return { eventGuestCreate: mockDb.eventGuestCreate(data) };
  },
  EventGuestUpdate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventGuestUpdate>[1];
    return {
      eventGuestUpdate: mockDb.eventGuestUpdate(String(variables["eventGuestUpdateId"]), data),
    };
  },
  EventGuestDestroy(variables) {
    return {
      eventGuestDestroy: mockDb.eventGuestDestroy(String(variables["eventGuestDestroyId"])),
    };
  },
  CreateGuest(variables) {
    const input = variables["input"] as Parameters<typeof mockDb.createGuest>[0];
    return { createGuest: mockDb.createGuest(input) };
  },
  UpdateGuest(variables) {
    const input = variables["input"] as Parameters<typeof mockDb.updateGuest>[1];
    return { updateGuest: mockDb.updateGuest(String(variables["id"]), input) };
  },
  BulkImportGuests(variables) {
    const input = variables["input"] as {
      eventId: string;
      guests: Parameters<typeof mockDb.bulkImportGuests>[1];
    };
    return {
      bulkImportGuests: mockDb.bulkImportGuests(input.eventId, input.guests),
    };
  },
  DashboardOverview() {
    return { dashboardOverview: mockDb.dashboardOverview() };
  },
  StaffUpdateProfile(variables) {
    const profile = variables["profile"] as {
      fullName: string;
      countryCode: string;
      phoneNumber: string;
      avatar?: {
        id?: string | null;
        name?: string | null;
        publicUrl?: string | null;
      } | null;
    };
    return {
      staffUpdateProfile: mockDb.updateAuthMeProfile(profile),
    };
  },
  EventAbayaLabelSetFind(variables) {
    return {
      eventAbayaLabelSetFind: mockDb.eventAbayaLabelSetFind(String(variables["eventId"])),
    };
  },
  EventAbayaLabelGenerate(variables) {
    const data = variables["data"] as {
      eventId: string;
      prefix: string;
      suffix?: string | null;
      from: number;
      to: number;
    };
    return { eventAbayaLabelGenerate: mockDb.eventAbayaLabelGenerate(data) };
  },
  EventTablesList(variables) {
    const args: Parameters<typeof mockDb.eventTablesList>[0] = {
      eventId: String(variables["eventId"]),
    };
    if (variables["sort"] != null) {
      args.sort = variables["sort"] as NonNullable<
        Parameters<typeof mockDb.eventTablesList>[0]["sort"]
      >;
    }
    if (variables["pagination"] != null) {
      args.pagination = variables["pagination"] as NonNullable<
        Parameters<typeof mockDb.eventTablesList>[0]["pagination"]
      >;
    }
    if (variables["filters"] != null) {
      args.filters = variables["filters"] as NonNullable<
        Parameters<typeof mockDb.eventTablesList>[0]["filters"]
      >;
    }
    return { eventTablesList: mockDb.eventTablesList(args) };
  },
  EventStaffList(variables) {
    const args: Parameters<typeof mockDb.eventStaffList>[0] = {
      eventId: String(variables["eventId"]),
    };
    if (variables["sort"] != null) {
      args.sort = variables["sort"] as NonNullable<
        Parameters<typeof mockDb.eventStaffList>[0]["sort"]
      >;
    }
    if (variables["pagination"] != null) {
      args.pagination = variables["pagination"] as NonNullable<
        Parameters<typeof mockDb.eventStaffList>[0]["pagination"]
      >;
    }
    if (variables["filters"] != null) {
      args.filters = variables["filters"] as NonNullable<
        Parameters<typeof mockDb.eventStaffList>[0]["filters"]
      >;
    }
    return { eventStaffList: mockDb.eventStaffList(args) };
  },
  EventStaffCreate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.eventStaffCreate>[0];
    return { eventStaffCreate: mockDb.eventStaffCreate(data) };
  },
  EventStaffDestroy(variables) {
    return {
      eventStaffDestroy: mockDb.eventStaffDestroy(String(variables["eventStaffDestroyId"])),
    };
  },
  EventGuestCheckIn(variables) {
    return {
      eventGuestCheckIn: mockDb.eventGuestCheckIn(
        String(variables["eventId"]),
        String(variables["code"]),
      ),
    };
  },
  EventGuestFindByCode(variables) {
    return {
      eventGuestFindByCode: mockDb.eventGuestFindByCode(
        String(variables["eventId"]),
        String(variables["code"]),
      ),
    };
  },
  ChangeMyPassword() {
    return { changeMyPassword: true };
  },
  FrontDeskList(variables) {
    const args: Parameters<typeof mockDb.frontDeskList>[0] = {};
    if (variables["sort"] != null) {
      args.sort = variables["sort"] as NonNullable<
        Parameters<typeof mockDb.frontDeskList>[0]["sort"]
      >;
    }
    if (variables["pagination"] != null) {
      args.pagination = variables["pagination"] as NonNullable<
        Parameters<typeof mockDb.frontDeskList>[0]["pagination"]
      >;
    }
    if (variables["filters"] != null) {
      args.filters = variables["filters"] as NonNullable<
        Parameters<typeof mockDb.frontDeskList>[0]["filters"]
      >;
    }
    return { frontDeskList: mockDb.frontDeskList(args) };
  },
  FrontDeskCreate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.frontDeskCreate>[0];
    return { frontDeskCreate: mockDb.frontDeskCreate(data) };
  },
  FrontDeskApprove(variables) {
    return {
      frontDeskApprove: mockDb.frontDeskApprove(String(variables["frontDeskApproveId"])),
    };
  },
  FrontDeskReject(variables) {
    return {
      frontDeskReject: mockDb.frontDeskReject(
        String(variables["frontDeskRejectId"]),
        String(variables["reason"] ?? ""),
      ),
    };
  },
  UserUpdate(variables) {
    const data = variables["data"] as Parameters<typeof mockDb.userUpdate>[1];
    return { userUpdate: mockDb.userUpdate(String(variables["userUpdateId"]), data) };
  },
  UserAssignRole(variables) {
    const roleIds = variables["roleIds"];
    if (!Array.isArray(roleIds) || roleIds.some((id) => typeof id !== "string")) {
      throw new Error("roleIds must be a string array");
    }
    return {
      userAssignRole: mockDb.userAssignRole(String(variables["userAssignRoleId"]), roleIds),
    };
  },
  UserDestroy(variables) {
    return { userDestroy: mockDb.userDestroy(String(variables["userDestroyId"])) };
  },
  SetUserStatus(variables) {
    const status = variables["status"];
    if (status !== "active" && status !== "inactive") {
      throw new Error(`Unsupported status: ${String(status)}`);
    }
    return {
      setUserStatus: mockDb.setUserStatus(String(variables["setUserStatusId"]), status),
    };
  },
};

function resolveOperationName(operation: Operation): string {
  if (operation.operationName) return operation.operationName;
  const query = typeof operation.query === "string" ? operation.query : print(operation.query);
  const match = query.match(/\b(?:query|mutation|subscription)\s+([A-Za-z0-9_]+)/);
  return match?.[1] ?? "";
}

/**
 * Serves in-memory GraphQL responses so features can ship against the same
 * operation documents that will later hit the real HTTP endpoint.
 */
export const mockLink = new ApolloLink((operation: Operation) => {
  return new Observable((observer) => {
    const name = resolveOperationName(operation);
    const handler = handlers[name];

    queueMicrotask(() => {
      try {
        if (!handler) {
          throw new Error(`[graphql-mock] No handler for operation "${name}"`);
        }
        observer.next({ data: handler(operation.variables as Record<string, unknown>) });
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  });
});
