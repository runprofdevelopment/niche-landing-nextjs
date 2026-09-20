"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  formatInvitationDateLine,
  formatInvitationTimeLine,
  parseInvitationDateLine,
  parseInvitationTimeLine,
} from "@/features/invitations/utils/invitation-datetime";

import { MOCK_EVENTS, MOCK_HALLS } from "../data/mock-events";
import { mockTimelineForEvent } from "../data/mock-timeline";
import { COORDINATE_SYSTEM } from "../domain/coordinate-system";
import { seatsForTable } from "../domain/geometry";
import { uid } from "../utils/uid";

import type {
  AbayaLabelBatch,
  EventRecord,
  EventStaffAssignment,
  Guest,
  GuestGroup,
  Hall,
  HallBoundary,
  HallObject,
  Invitation,
  TableTemplate,
  TimelineSlot,
} from "../types";

export { COORDINATE_SYSTEM };

/** Remove the optional seat/table/hall keys entirely (exactOptionalPropertyTypes safe). */
function releaseSeat(g: Guest): Guest {
  const { seatId: _seatId, tableId: _tableId, hallId: _hallId, ...rest } = g;
  return rest;
}

/** Demo run-of-show for every seeded event. */
function mockTimeline(): TimelineSlot[] {
  return MOCK_EVENTS.flatMap((event) => mockTimelineForEvent(event.id));
}

/** Legacy slots stored datetime-local values ("2026-08-16T19:30") and had no status. */
function toTimeOnly(value: string | undefined): string {
  if (!value) return "";
  const [, time] = value.split("T");
  return (time ?? value).slice(0, 5);
}

type State = {
  events: EventRecord[];
  halls: Hall[];
  guests: Guest[];
  groups: GuestGroup[];
  invitations: Invitation[];
  timeline: TimelineSlot[];
  eventStaff: EventStaffAssignment[];
  abayaLabels: AbayaLabelBatch[];

  createEvent: (
    input: Omit<
      EventRecord,
      "id" | "createdAt" | "customerName" | "createdBy" | "invitationCount" | "status"
    > &
      Partial<Pick<EventRecord, "customerName" | "createdBy" | "invitationCount" | "status">>,
  ) => EventRecord;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, patch: Partial<Omit<EventRecord, "id" | "createdAt">>) => void;
  getEvent: (id: string) => EventRecord | undefined;
  seedMockEventsIfEmpty: () => void;

  createHall: (input: {
    eventId: string;
    name: string;
    hallType: Hall["hallType"];
    eventType?: string;
    expectedGuests: number;
    boundary: HallBoundary;
    tableTemplates: TableTemplate[];
  }) => Hall;
  /** Upsert a hall from API into the local cache (preserves layout.objects when present). */
  upsertHall: (hall: Hall) => void;
  /** First hall for an event (legacy helpers). Prefer hallsForEvent. */
  hallForEvent: (eventId: string) => Hall | undefined;
  /** Returns a new array per call — derive with `useMemo`, never call inside a store selector. */
  hallsForEvent: (eventId: string) => Hall[];
  getHall: (hallId: string) => Hall | undefined;
  saveLayout: (hallId: string, objects: HallObject[]) => void;
  updateHall: (hallId: string, patch: Partial<Hall>) => void;
  deleteHall: (hallId: string) => void;

  addGuest: (g: Omit<Guest, "id">) => void;
  /** Sync a guest returned from GraphQL into local UI state (keeps seating in sync). */
  upsertGuest: (guest: Guest) => void;
  upsertGuests: (guests: Guest[]) => void;
  updateGuest: (id: string, patch: Partial<Omit<Guest, "id" | "eventId">>) => void;
  addGroup: (eventId: string, name: string) => GuestGroup;
  renameGroup: (groupId: string, name: string) => void;
  removeGroup: (groupId: string, removeMembers?: boolean) => void;
  setGuestGroup: (guestId: string, familyId?: string) => void;
  removeGuest: (id: string) => void;
  assignGuestToTable: (guestId: string, tableId: string) => { ok: boolean; message: string };
  /** Seat unseated guests that share the same `familyName` (not familyId). */
  assignFamilyToTable: (familyName: string, tableId: string) => { ok: boolean; message: string };
  assignGuestToSeat: (guestId: string, seatId: string, tableId: string, hallId?: string) => void;
  unassignGuest: (guestId: string) => void;
  seedDemoGuests: (eventId: string) => void;

  checkInGuest: (guestId: string) => void;
  checkOutGuest: (guestId: string) => void;
  resetAttendance: (guestId: string) => void;
  getInvitation: (eventId: string) => Invitation | undefined;
  saveInvitation: (inv: Invitation) => void;

  addTimelineSlot: (slot: Omit<TimelineSlot, "id">) => void;
  updateTimelineSlot: (id: string, patch: Partial<Omit<TimelineSlot, "id" | "eventId">>) => void;
  removeTimelineSlot: (id: string) => void;

  assignEventStaff: (
    input: Omit<EventStaffAssignment, "id" | "assignedAt">,
  ) => EventStaffAssignment;
  /** Detaches the member from the event; the directory record is untouched. */
  removeEventStaff: (id: string) => void;

  getAbayaLabels: (eventId: string) => AbayaLabelBatch | undefined;
  /** One batch per event — saving replaces the previous numbering. */
  saveAbayaLabels: (batch: AbayaLabelBatch) => void;
};

export function defaultInvitation(
  eventId: string,
  ev?: {
    brideName?: string;
    groomName?: string;
    date?: string;
    startTime?: string;
    venueName?: string;
  },
): Invitation {
  const date = ev?.date ? parseInvitationDateLine(ev.date) : null;
  const time = ev?.startTime ? parseInvitationTimeLine(ev.startTime) : null;

  return {
    eventId,
    language: "English",
    layout: "classic",
    headingFont: "Domine",
    bodyFont: "Arimo",
    namesFontSize: 48,
    accent: "#8a6d2f",
    background: "#fbf8f1",
    brideName: ev?.brideName ?? "First Client",
    groomName: ev?.groomName ?? "Second Client",
    title: "Together with their families",
    message: "request the pleasure of your company\nat the celebration of their marriage",
    dateLine: date ? formatInvitationDateLine(date, "English") : (ev?.date ?? ""),
    timeLine: time ? formatInvitationTimeLine(time) : (ev?.startTime ?? ""),
    venueLine: ev?.venueName ?? "",
    footer: "Dinner & dancing to follow",
  };
}

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      events: [],
      halls: [],
      guests: [],
      groups: [],
      invitations: [],
      timeline: [],
      eventStaff: [],
      abayaLabels: [],

      createEvent: (input) => {
        const customerBase = input.customerName || input.groomName || input.brideName;
        const ev: EventRecord = {
          ...input,
          customerName:
            input.customerName || (customerBase ? `${customerBase.split(" ")[0]} Family` : ""),
          createdBy: input.createdBy ?? "App",
          invitationCount: input.invitationCount ?? 0,
          status: input.status ?? "upcoming",
          id: uid("event"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ events: [ev, ...s.events] }));
        return ev;
      },
      seedMockEventsIfEmpty: () => {
        if (get().events.length > 0) return;
        set({ events: MOCK_EVENTS, halls: MOCK_HALLS, timeline: mockTimeline() });
      },
      deleteEvent: (id) =>
        set((s) => ({
          events: s.events.filter((e) => e.id !== id),
          halls: s.halls.filter((h) => h.eventId !== id),
          guests: s.guests.filter((g) => g.eventId !== id),
          groups: s.groups.filter((g) => g.eventId !== id),
          timeline: s.timeline.filter((t) => t.eventId !== id),
          invitations: s.invitations.filter((i) => i.eventId !== id),
          eventStaff: s.eventStaff.filter((a) => a.eventId !== id),
          abayaLabels: s.abayaLabels.filter((b) => b.eventId !== id),
        })),
      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((event) => (event.id === id ? { ...event, ...patch } : event)),
        })),
      getEvent: (id) => get().events.find((e) => e.id === id),

      createHall: ({
        eventId,
        name,
        hallType,
        eventType,
        expectedGuests,
        boundary,
        tableTemplates,
      }) => {
        const hall: Hall = {
          id: uid("hall"),
          eventId,
          name,
          hallType,
          expectedGuests,
          boundary,
          tableTemplates,
          layout: { hallId: "", coordinateSystem: { ...COORDINATE_SYSTEM }, objects: [] },
          ...(eventType ? { eventType } : {}),
        };
        hall.layout.hallId = hall.id;
        set((s) => ({ halls: [...s.halls, hall] }));
        return hall;
      },
      upsertHall: (hall) => {
        set((s) => {
          const existing = s.halls.find((entry) => entry.id === hall.id);
          const next: Hall = existing
            ? {
                ...hall,
                layout: {
                  ...hall.layout,
                  objects: existing.layout.objects.length
                    ? existing.layout.objects
                    : hall.layout.objects,
                },
              }
            : hall;
          const halls = existing
            ? s.halls.map((entry) => (entry.id === hall.id ? next : entry))
            : [...s.halls, next];
          return { halls };
        });
      },
      hallForEvent: (eventId) => get().halls.find((h) => h.eventId === eventId),
      hallsForEvent: (eventId) => get().halls.filter((h) => h.eventId === eventId),
      getHall: (hallId) => get().halls.find((h) => h.id === hallId),
      updateHall: (hallId, patch) =>
        set((s) => ({ halls: s.halls.map((h) => (h.id === hallId ? { ...h, ...patch } : h)) })),
      deleteHall: (hallId) => set((s) => ({ halls: s.halls.filter((h) => h.id !== hallId) })),
      saveLayout: (hallId, objects) =>
        set((s) => {
          const validSeatIds = new Set(
            objects.flatMap((o) => seatsForTable(o).map((seat) => seat.id)),
          );
          return {
            halls: s.halls.map((h) =>
              h.id === hallId ? { ...h, layout: { ...h.layout, objects } } : h,
            ),
            guests: s.guests.map((g) =>
              g.seatId && !validSeatIds.has(g.seatId) ? releaseSeat(g) : g,
            ),
          };
        }),

      addGuest: (g) => set((s) => ({ guests: [...s.guests, { ...g, id: uid("guest") }] })),
      upsertGuest: (guest) =>
        set((s) => {
          const exists = s.guests.some((g) => g.id === guest.id);
          return {
            guests: exists
              ? s.guests.map((g) => (g.id === guest.id ? guest : g))
              : [...s.guests, guest],
          };
        }),
      upsertGuests: (guests) =>
        set((s) => {
          const byId = new Map(s.guests.map((g) => [g.id, g]));
          for (const guest of guests) {
            const existing = byId.get(guest.id);
            byId.set(guest.id, {
              ...existing,
              ...guest,
              // Keep local check-in/out if the API payload still has nulls
              ...(existing?.checkedInAt && !guest.checkedInAt
                ? { checkedInAt: existing.checkedInAt }
                : {}),
              ...(existing?.checkedOutAt && !guest.checkedOutAt
                ? { checkedOutAt: existing.checkedOutAt }
                : {}),
            });
          }
          return { guests: [...byId.values()] };
        }),
      updateGuest: (id, patch) =>
        set((s) => ({
          guests: s.guests.map((g) => {
            if (g.id !== id) return g;
            const next = { ...g, ...patch };
            if (patch.gender === "male") {
              const { abayaLabel: _drop, ...rest } = next;
              return rest;
            }
            return next;
          }),
        })),
      addGroup: (eventId, name) => {
        const group: GuestGroup = { id: uid("group"), eventId, name };
        set((s) => ({ groups: [...s.groups, group] }));
        return group;
      },
      removeGuest: (id) => set((s) => ({ guests: s.guests.filter((g) => g.id !== id) })),

      renameGroup: (groupId, name) =>
        set((s) => ({ groups: s.groups.map((g) => (g.id === groupId ? { ...g, name } : g)) })),

      removeGroup: (groupId, removeMembers = false) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== groupId),
          guests: removeMembers
            ? s.guests.filter((g) => g.familyId !== groupId)
            : s.guests.map((g): Guest => {
                if (g.familyId !== groupId) return g;
                const { familyId: _drop, ...rest } = g;
                return rest;
              }),
        })),

      setGuestGroup: (guestId, familyId) =>
        set((s) => ({
          guests: s.guests.map((g): Guest => {
            if (g.id !== guestId) return g;
            if (!familyId) {
              const { familyId: _drop, ...rest } = g;
              return rest;
            }
            return { ...g, familyId };
          }),
        })),

      assignGuestToSeat: (guestId, seatId, tableId, hallId) =>
        set((s) => {
          const occupant = s.guests.find((g) => g.seatId === seatId);
          const moving = s.guests.find((g) => g.id === guestId);
          const fromSeat = moving?.seatId;
          const fromTable = moving?.tableId;
          const fromHall = moving?.hallId;
          return {
            guests: s.guests.map((g): Guest => {
              if (g.id === guestId) {
                return {
                  ...g,
                  seatId,
                  tableId,
                  ...(hallId ? { hallId } : {}),
                };
              }
              if (occupant && g.id === occupant.id) {
                return fromSeat && fromTable
                  ? {
                      ...g,
                      seatId: fromSeat,
                      tableId: fromTable,
                      ...(fromHall ? { hallId: fromHall } : {}),
                    }
                  : releaseSeat(g);
              }
              return g;
            }),
          };
        }),

      unassignGuest: (guestId) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === guestId ? releaseSeat(g) : g)),
        })),

      assignGuestToTable: (guestId, tableId) => {
        const state = get();
        const hall = state.halls.find((h) => h.layout.objects.some((o) => o.id === tableId));
        const table = hall?.layout.objects.find((o) => o.id === tableId);
        if (!table) return { ok: false, message: "Table not found" };
        const seats = seatsForTable(table);
        const taken = new Set(state.guests.filter((g) => g.seatId).map((g) => g.seatId));
        const free = seats.find((s) => !taken.has(s.id));
        if (!free) return { ok: false, message: `${table.label} is full` };
        get().assignGuestToSeat(guestId, free.id, tableId, hall?.id);
        return { ok: true, message: `Seat ${free.number}` };
      },

      assignFamilyToTable: (familyName, tableId) => {
        const state = get();
        const hall = state.halls.find((h) => h.layout.objects.some((o) => o.id === tableId));
        const table = hall?.layout.objects.find((o) => o.id === tableId);
        if (!table || !hall) return { ok: false, message: "Table not found" };
        const normalized = familyName.trim().toLowerCase();
        if (!normalized) return { ok: false, message: "Family name required" };
        const seats = seatsForTable(table);
        const taken = new Set(
          state.guests.filter((g) => g.eventId === hall.eventId && g.seatId).map((g) => g.seatId),
        );
        const members = state.guests.filter(
          (g) =>
            g.eventId === hall.eventId &&
            (g.familyName ?? "").trim().toLowerCase() === normalized &&
            !g.seatId,
        );
        if (members.length === 0) {
          return { ok: false, message: "All family members are already seated" };
        }
        const free = seats.filter((s) => !taken.has(s.id));
        if (free.length === 0) return { ok: false, message: `${table.label} is full` };
        const n = Math.min(free.length, members.length);
        for (let i = 0; i < n; i++) {
          get().assignGuestToSeat(members[i]!.id, free[i]!.id, tableId, hall.id);
        }
        return {
          ok: true,
          message:
            n === members.length
              ? `Seated ${n} guests`
              : `Seated ${n} of ${members.length} — need a larger table for the rest`,
        };
      },

      seedDemoGuests: (eventId) => {
        const existing = get().guests.filter((g) => g.eventId === eventId);
        const hasDemoFamily = existing.some((g) => g.familyName === "Al-Fahad Family");
        const hasDemoIndividual = existing.some(
          (g) => g.name === "Ali Naser" && !g.familyName?.trim(),
        );
        if (hasDemoFamily && hasDemoIndividual) return;

        const familyDefs = [
          {
            name: "Al-Fahad Family",
            members: ["Omar Al-Fahad", "Mariam Al-Fahad", "Layla Al-Fahad"],
          },
          { name: "Al-Naser Family", members: ["Hassan Al-Naser", "Noura Al-Naser"] },
          {
            name: "Al-Saeed Family",
            members: ["Yousef Al-Saeed", "Reem Al-Saeed", "Sara Al-Saeed"],
          },
          { name: "Al-Otaibi Family", members: ["Khalid Al-Otaibi", "Amal Al-Otaibi"] },
        ] as const;

        const individualNames = [
          "Ali Naser",
          "Fatima Al-Saeed",
          "Yousef Ahmed",
          "Zaid Al-Harbi",
          "Khalid Mansoor",
          "Amal Guest",
        ];

        const groups: GuestGroup[] = [];
        const guests: Guest[] = [];

        if (!hasDemoFamily) {
          for (const family of familyDefs) {
            const group: GuestGroup = { id: uid("group"), eventId, name: family.name };
            groups.push(group);
            for (const memberName of family.members) {
              guests.push({
                id: uid("guest"),
                eventId,
                name: memberName,
                familyName: family.name,
                familyId: group.id,
              });
            }
          }
        }

        if (!hasDemoIndividual) {
          for (const name of individualNames) {
            guests.push({
              id: uid("guest"),
              eventId,
              name,
            });
          }
        }

        if (guests.length === 0) return;

        set((s) => ({
          groups: [...s.groups, ...groups],
          guests: [...s.guests, ...guests],
        }));
      },

      checkInGuest: (guestId) =>
        set((s) => ({
          guests: s.guests.map((g): Guest => {
            if (g.id !== guestId) return g;
            const { checkedOutAt: _drop, ...rest } = g;
            return { ...rest, checkedInAt: new Date().toISOString() };
          }),
        })),

      checkOutGuest: (guestId) =>
        set((s) => ({
          guests: s.guests.map((g): Guest =>
            g.id === guestId ? { ...g, checkedOutAt: new Date().toISOString() } : g,
          ),
        })),

      resetAttendance: (guestId) =>
        set((s) => ({
          guests: s.guests.map((g): Guest => {
            if (g.id !== guestId) return g;
            const { checkedInAt: _a, checkedOutAt: _b, ...rest } = g;
            return rest;
          }),
        })),

      getInvitation: (eventId) => get().invitations.find((i) => i.eventId === eventId),

      saveInvitation: (inv) =>
        set((s) => ({
          invitations: [...s.invitations.filter((i) => i.eventId !== inv.eventId), inv],
        })),

      addTimelineSlot: (slot) =>
        set((s) => ({ timeline: [...s.timeline, { ...slot, id: uid("slot") }] })),

      updateTimelineSlot: (id, patch) =>
        set((s) => ({ timeline: s.timeline.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      removeTimelineSlot: (id) => set((s) => ({ timeline: s.timeline.filter((t) => t.id !== id) })),

      assignEventStaff: (input) => {
        const assignment: EventStaffAssignment = {
          ...input,
          id: uid("event-staff"),
          assignedAt: new Date().toISOString(),
        };
        set((s) => ({ eventStaff: [assignment, ...s.eventStaff] }));
        return assignment;
      },

      removeEventStaff: (id) =>
        set((s) => ({ eventStaff: s.eventStaff.filter((a) => a.id !== id) })),

      getAbayaLabels: (eventId) => get().abayaLabels.find((b) => b.eventId === eventId),

      saveAbayaLabels: (batch) =>
        set((s) => ({
          abayaLabels: [...s.abayaLabels.filter((b) => b.eventId !== batch.eventId), batch],
        })),
    }),
    {
      name: "event-ops-store",
      version: 7,
      /** Steps apply in order, so a store several versions behind lands fully migrated. */
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;
        let state = persistedState as Partial<State>;

        const hasLegacyEvents = state.events?.some((event) => !("status" in event));
        if (!state.events?.length || (version < 2 && hasLegacyEvents)) {
          return { ...state, events: MOCK_EVENTS, halls: MOCK_HALLS, timeline: mockTimeline() };
        }

        if (version < 2) {
          state = {
            ...state,
            events: state.events.map((event) => ({
              ...event,
              customerName:
                event.customerName ??
                `${(event.groomName || event.brideName || "Guest").split(" ")[0]} Family`,
              createdBy: event.createdBy ?? "App",
              invitationCount: event.invitationCount ?? 0,
              status: event.status ?? "upcoming",
            })),
          };
        }

        if (version < 3) {
          state = {
            ...state,
            halls: (state.halls ?? []).map((hall) => ({
              ...hall,
              hallType: hall.hallType ?? "wedding",
            })),
          };
        }

        if (version < 4) {
          state = {
            ...state,
            guests: (state.guests ?? []).map((guest) => {
              const legacy = guest as Guest & { groupId?: string };
              if (legacy.familyId || !legacy.groupId) {
                const { groupId: _drop, ...rest } = legacy;
                return rest;
              }
              const { groupId, ...rest } = legacy;
              return { ...rest, familyId: groupId };
            }),
          };
        }

        if (version < 5) {
          const timeline = state.timeline ?? [];
          state = {
            ...state,
            timeline:
              timeline.length === 0
                ? mockTimeline()
                : timeline.map((slot) => ({
                    ...slot,
                    start: toTimeOnly(slot.start),
                    end: toTimeOnly(slot.end),
                    status: slot.status ?? "pending",
                  })),
          };
        }

        if (version < 6) {
          state = { ...state, eventStaff: state.eventStaff ?? [] };
        }

        if (version < 7) {
          state = { ...state, abayaLabels: state.abayaLabels ?? [] };
        }

        return state;
      },
    },
  ),
);
