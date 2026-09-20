/**
 * In-memory mock GraphQL data store used while the backend is unavailable.
 * Swap MockLink for HttpLink when the real API is ready — feature operations stay the same.
 */

type MockUser = {
  __typename: "User";
  id: string;
  email: string;
  fullName: string | null;
  department: string | null;
  role: string | null;
};

type MockAuthAvatar = {
  __typename: "AuthAvatar";
  id: string;
  name: string | null;
  publicUrl: string | null;
};

type MockStaffProfile = {
  __typename: "StaffProfile";
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  countryCode: string | null;
  formattedPhoneNumber: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  profileType: "staff";
  status: string | null;
  provider: string | null;
  internalId: string | null;
  avatar: MockAuthAvatar | null;
  isOwner: boolean;
  permissions: string[] | null;
  roles: string[] | null;
  roleIds: string[] | null;
};

type EventGuestApiStatus = "expected" | "confirmed" | "cancelled";
type EventGuestApiGender = "male" | "female" | "NA";

type MockGuest = {
  __typename: "Guest";
  id: string;
  eventId: string;
  name: string;
  familyName: string | null;
  email: string | null;
  phone: string | null;
  gender: "MALE" | "FEMALE" | null;
  abayaLabel: string | null;
  code: string | null;
  rsvpStatus: "CONFIRMED" | "MAYBE" | "UNCONFIRMED" | null;
  groupId: string | null;
  hallId: string | null;
  seatId: string | null;
  tableId: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  countryCode?: string | null;
  apiGender?: EventGuestApiGender | null;
  apiStatus?: EventGuestApiStatus | null;
  numberOfCompanions?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type MockEventStatus = "ACTIVE" | "UPCOMING" | "PAST";
type MockEventCreatedBy = "APP" | "OPERATIONAL";

type MockEvent = {
  __typename: "Event";
  id: string;
  name: string;
  brideName: string;
  groomName: string;
  customerName: string;
  ownerId: string | null;
  createdBy: MockEventCreatedBy;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  expectedGuests: number;
  hallCapacity: number | null;
  hallReference: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  invitationCount: number;
  status: MockEventStatus;
  eventType: string | null;
  language: string;
  createdAt: string;
};

type MockEventHallPoint = { x: number; y: number };

type MockEventHallBoundary = {
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number | null;
  points: MockEventHallPoint[] | null;
};

type MockEventHallTableTemplate = {
  id: string;
  capacity: number;
  numberOfTables: number;
  seatNaming: string;
  tableNaming: string;
  tableShape: string;
};

type MockHallObject = {
  id: string;
  eventId: string;
  eventHallId: string;
  templateId: string | null;
  label: string;
  type: string;
  geometry: string | null;
  table: { capacity: number; reservedSeats: number; shape: string } | null;
  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
  };
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  createdBy?: string | null;
};

type MockEventHall = {
  id: string;
  eventId: string;
  name: string;
  status: string | null;
  layoutVersion: number;
  coordinateSystem: { width: number; height: number };
  boundary: MockEventHallBoundary;
  tableTemplates: MockEventHallTableTemplate[];
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

type CreateEventHallInput = {
  eventId: string;
  name: string;
  coordinateSystem: { width: number; height: number };
  boundary: {
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number | null;
    points?: MockEventHallPoint[] | null;
  };
  tableTemplates: Array<{
    capacity: number;
    numberOfTables: number;
    seatNaming: string;
    tableNaming: string;
    tableShape: string;
  }>;
  status?: string | null;
};

type UpdateEventHallInput = Partial<{
  name: string | null;
  status: string | null;
  coordinateSystem: { width: number; height: number } | null;
  boundary: CreateEventHallInput["boundary"] | null;
  tableTemplates: CreateEventHallInput["tableTemplates"] | null;
}>;

type CreateGuestInput = {
  eventId: string;
  name: string;
  familyName?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: "MALE" | "FEMALE" | null;
  code?: string | null;
  abayaLabel?: string | null;
  rsvpStatus?: "CONFIRMED" | "MAYBE" | "UNCONFIRMED" | null;
  groupId?: string | null;
};

type CreateEventInput = {
  name: string;
  brideName: string;
  groomName: string;
  customerName?: string | null;
  ownerId?: string | null;
  createdBy?: MockEventCreatedBy | null;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  expectedGuests: number;
  hallCapacity?: number | null;
  hallReference?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  eventType?: string | null;
  language: string;
  status?: MockEventStatus | null;
};

type UpdateEventInput = Partial<{
  name: string | null;
  brideName: string | null;
  groomName: string | null;
  customerName: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  venueName: string | null;
  expectedGuests: number | null;
  hallCapacity: number | null;
  hallReference: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  eventType: string | null;
  language: string | null;
  status: MockEventStatus | null;
  invitationCount: number | null;
}>;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function offsetDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const users = new Map<string, MockUser>();
const events = new Map<string, MockEvent>();
const guestsByEvent = new Map<string, MockGuest[]>();
const hallsById = new Map<string, MockEventHall>();
const hallIdsByEvent = new Map<string, string[]>();
const hallObjectsByHall = new Map<string, MockHallObject[]>();
const abayaLabelSets = new Map<
  string,
  {
    id: string;
    eventId: string;
    prefix: string;
    suffix: string;
    from: number;
    to: number;
    totalLabels: number;
    assignedLabels: number;
    availableLabels: number;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  }
>();
const eventStaffByEvent = new Map<
  string,
  Array<{
    id: string;
    eventId: string;
    role: "staff" | "frontdesk";
    fullName: string;
    email: string;
    phoneNumber: string;
    formattedPhoneNumber: string;
    countryCode: string;
    note: string;
    createdAt: string;
    updatedAt: string;
  }>
>();
const seatsByEvent = new Map<
  string,
  Array<{
    id: string;
    eventId: string;
    hallId: string;
    tableId: string;
    seatIndex: number;
    guestId: string;
  }>
>();

function decorateHall(hall: MockEventHall) {
  const objects = hallObjectsByHall.get(hall.id) ?? [];
  const remainingByKey = new Map<string, number>();
  for (const object of objects) {
    if (object.type !== "table" || !object.table) continue;
    const key = `${object.table.shape}:${object.table.capacity}`;
    remainingByKey.set(key, (remainingByKey.get(key) ?? 0) + 1);
  }

  return {
    ...hall,
    tableTemplates: hall.tableTemplates.map((template) => {
      const byTemplateId = objects.filter(
        (object) => object.templateId === template.id && object.type === "table",
      ).length;
      const key = `${template.tableShape}:${template.capacity}`;
      const byShapeCapacity = remainingByKey.get(key) ?? 0;
      const locked = Math.max(byTemplateId, byShapeCapacity);
      if (byShapeCapacity > 0) remainingByKey.set(key, 0);
      return {
        ...template,
        createdObjectCount: locked,
      };
    }),
  };
}

users.set("user_demo", {
  __typename: "User",
  id: "user_demo",
  email: "demo@niche.local",
  fullName: "Demo Operator",
  department: "Events",
  role: "admin",
});

const authMeDemo: MockStaffProfile = {
  __typename: "StaffProfile",
  id: "user_demo",
  email: "demo@niche.local",
  emailVerified: true,
  fullName: "Demo Operator",
  countryCode: "+966",
  formattedPhoneNumber: "+966500000000",
  phoneNumber: "500000000",
  photoURL: null,
  profileType: "staff",
  status: "active",
  provider: "password",
  internalId: "staff_demo",
  avatar: null,
  isOwner: true,
  permissions: [],
  roles: ["owner"],
  roleIds: ["role_owner"],
};

const SEED_EVENTS: MockEvent[] = [
  {
    __typename: "Event",
    id: "event-mock-active-1",
    name: "Al-Rashid Wedding",
    brideName: "Fatima Al-Rashid",
    groomName: "Ahmed Al-Rashid",
    customerName: "Al-Rashid Family",
    ownerId: "owner-mock-1",
    createdBy: "APP",
    date: offsetDate(0),
    startTime: "18:00",
    endTime: "23:00",
    venueName: "Grand Palace Hotel",
    expectedGuests: 250,
    hallCapacity: null,
    hallReference: null,
    address: null,
    googleMapsUrl: null,
    invitationCount: 180,
    status: "ACTIVE",
    eventType: "wedding",
    language: "en",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    __typename: "Event",
    id: "event-mock-upcoming-1",
    name: "Khalid & Noura Engagement",
    brideName: "Noura Al-Qahtani",
    groomName: "Khalid Al-Qahtani",
    customerName: "Al-Qahtani Family",
    ownerId: "owner-mock-2",
    createdBy: "APP",
    date: offsetDate(14),
    startTime: "20:00",
    endTime: "23:00",
    venueName: "Skyline Ballroom",
    expectedGuests: 120,
    hallCapacity: null,
    hallReference: null,
    address: null,
    googleMapsUrl: null,
    invitationCount: 95,
    status: "UPCOMING",
    eventType: "engagement",
    language: "en",
    createdAt: "2026-02-15T09:00:00.000Z",
  },
  {
    __typename: "Event",
    id: "event-mock-past-1",
    name: "Al-Harbi Golden Anniversary",
    brideName: "Hanan Al-Harbi",
    groomName: "Saeed Al-Harbi",
    customerName: "Al-Harbi Family",
    ownerId: "owner-mock-3",
    createdBy: "OPERATIONAL",
    date: offsetDate(-10),
    startTime: "19:00",
    endTime: "23:00",
    venueName: "Royal Garden Resort",
    expectedGuests: 150,
    hallCapacity: null,
    hallReference: null,
    address: null,
    googleMapsUrl: null,
    invitationCount: 142,
    status: "PAST",
    eventType: "other",
    language: "ar",
    createdAt: "2026-01-05T12:00:00.000Z",
  },
];

for (const event of SEED_EVENTS) {
  events.set(event.id, event);
}

const SEED_GUESTS: MockGuest[] = [
  {
    __typename: "Guest",
    id: "guest-mock-1",
    eventId: "event-mock-active-1",
    name: "Fatimah Al-Otaibi",
    familyName: "Al-Otaibi",
    email: "fatimah.otaibi@gmail.com",
    phone: "+966501234567",
    gender: "FEMALE",
    abayaLabel: "ABY-001",
    code: "Guest-001",
    rsvpStatus: "CONFIRMED",
    groupId: "family-otaibi",
    hallId: null,
    seatId: "1",
    tableId: "T1",
    checkedInAt: "2026-09-05T17:42:00.000Z",
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-2",
    eventId: "event-mock-active-1",
    name: "Noura Al-Sudairy",
    familyName: "Al-Sudairy",
    email: "noura.sudairy@gmail.com",
    phone: "+966551112233",
    gender: "FEMALE",
    abayaLabel: "ABY-002",
    code: "Guest-002",
    rsvpStatus: "CONFIRMED",
    groupId: "family-sudairy",
    hallId: null,
    seatId: "2",
    tableId: "T1",
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-3",
    eventId: "event-mock-active-1",
    name: "Omar Al-Fahad",
    familyName: "Al-Fahad",
    email: "omar.fahad@gmail.com",
    phone: "+966564445555",
    gender: "MALE",
    abayaLabel: null,
    code: "Guest-003",
    rsvpStatus: "CONFIRMED",
    groupId: "family-fahad",
    hallId: null,
    seatId: "1",
    tableId: "T2",
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-4",
    eventId: "event-mock-active-1",
    name: "Sara Al-Harbi",
    familyName: "Al-Harbi",
    email: "sara.harbi@gmail.com",
    phone: "+966507778899",
    gender: "FEMALE",
    abayaLabel: "ABY-003",
    code: "Guest-004",
    rsvpStatus: "CONFIRMED",
    groupId: "family-harbi",
    hallId: null,
    seatId: "3",
    tableId: "T2",
    checkedInAt: "2026-09-05T18:05:00.000Z",
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-5",
    eventId: "event-mock-active-1",
    name: "Khalid Al-Mutairi",
    familyName: "Al-Mutairi",
    email: "khalid.mutairi@gmail.com",
    phone: "+966531234321",
    gender: "MALE",
    abayaLabel: null,
    code: "Guest-005",
    rsvpStatus: "MAYBE",
    groupId: "family-mutairi",
    hallId: null,
    seatId: "4",
    tableId: "T3",
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-6",
    eventId: "event-mock-active-1",
    name: "Layla Al-Qahtani",
    familyName: "Al-Qahtani",
    email: "layla.qahtani@gmail.com",
    phone: "+966540001122",
    gender: "FEMALE",
    abayaLabel: "ABY-004",
    code: "Guest-006",
    rsvpStatus: "CONFIRMED",
    groupId: "family-qahtani",
    hallId: null,
    seatId: "1",
    tableId: "T3",
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-7",
    eventId: "event-mock-active-1",
    name: "Yousef Al-Dosari",
    familyName: "Al-Dosari",
    email: "yousef.dosari@gmail.com",
    phone: "+966598765432",
    gender: "MALE",
    abayaLabel: null,
    code: "Guest-007",
    rsvpStatus: "CONFIRMED",
    groupId: "family-dosari",
    hallId: null,
    seatId: "2",
    tableId: "T4",
    checkedInAt: "2026-09-05T17:55:00.000Z",
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-8",
    eventId: "event-mock-active-1",
    name: "Hanan Al-Shammari",
    familyName: "Al-Shammari",
    email: "hanan.shammari@gmail.com",
    phone: "+966512345678",
    gender: "FEMALE",
    abayaLabel: "ABY-005",
    code: "Guest-008",
    rsvpStatus: "UNCONFIRMED",
    groupId: "family-shammari",
    hallId: null,
    seatId: null,
    tableId: null,
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-9",
    eventId: "event-mock-active-1",
    name: "Faisal Al-Ghamdi",
    familyName: "Al-Ghamdi",
    email: "faisal.ghamdi@gmail.com",
    phone: "+966555667788",
    gender: "MALE",
    abayaLabel: null,
    code: "Guest-009",
    rsvpStatus: "CONFIRMED",
    groupId: "family-ghamdi",
    hallId: null,
    seatId: "5",
    tableId: "T1",
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-10",
    eventId: "event-mock-active-1",
    name: "Reem Al-Anazi",
    familyName: "Al-Anazi",
    email: "reem.anazi@gmail.com",
    phone: "+966566778899",
    gender: "FEMALE",
    abayaLabel: "ABY-006",
    code: "Guest-010",
    rsvpStatus: "CONFIRMED",
    groupId: "family-anazi",
    hallId: null,
    seatId: "2",
    tableId: "T2",
    checkedInAt: "2026-09-05T18:12:00.000Z",
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-upcoming-1",
    eventId: "event-mock-upcoming-1",
    name: "Maha Al-Qahtani",
    familyName: "Al-Qahtani",
    email: "maha.qahtani@gmail.com",
    phone: "+966501010101",
    gender: "FEMALE",
    abayaLabel: "ABY-001",
    code: "Guest-001",
    rsvpStatus: "CONFIRMED",
    groupId: "family-qahtani-up",
    hallId: null,
    seatId: null,
    tableId: null,
    checkedInAt: null,
    checkedOutAt: null,
  },
  {
    __typename: "Guest",
    id: "guest-mock-upcoming-2",
    eventId: "event-mock-upcoming-1",
    name: "Turki Al-Qahtani",
    familyName: "Al-Qahtani",
    email: "turki.qahtani@gmail.com",
    phone: "+966502020202",
    gender: "MALE",
    abayaLabel: null,
    code: "Guest-002",
    rsvpStatus: "MAYBE",
    groupId: "family-qahtani-up",
    hallId: null,
    seatId: null,
    tableId: null,
    checkedInAt: null,
    checkedOutAt: null,
  },
];

for (const guest of SEED_GUESTS) {
  const list = guestsByEvent.get(guest.eventId) ?? [];
  list.push(guest);
  guestsByEvent.set(guest.eventId, list);
}

type MockFrontDeskStatus = "active" | "inactive" | "pending" | "rejected";

type MockFrontDesk = {
  id: string;
  status: MockFrontDeskStatus;
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  formattedPhoneNumber: string;
  gender: "male" | "female" | null;
  createdAt: string;
  rejectionReason: string | null;
};

const frontDeskMembers = new Map<string, MockFrontDesk>(
  (
    [
      ["fd-1", "active", "Faisal Al-Dosari", "faisal.dosari@email.com", "male", "2026-01-10"],
      ["fd-2", "active", "Nasser Al-Mutairi", "nasser.mutairi@email.com", "male", "2026-01-12"],
      ["fd-3", "inactive", "Khalid Al-Harbi", "khalid.harbi@email.com", "male", "2026-01-15"],
      ["fd-4", "inactive", "Omar Al-Qahtani", "omar.qahtani@email.com", "male", "2026-01-18"],
      ["fd-5", "pending", "Yousef Al-Shammari", "yousef.shammari@email.com", "male", "2026-02-02"],
      ["fd-6", "pending", "Sara Al-Otaibi", "sara.otaibi@email.com", "female", "2026-02-08"],
      ["fd-7", "rejected", "Lama Al-Ghamdi", "lama.ghamdi@email.com", "female", "2026-01-22"],
    ] as const
  ).map(([id, status, fullName, email, gender, createdAt], index) => {
    const phoneNumber = `50${String(1112233 + index).padStart(7, "0")}`;
    const member: MockFrontDesk = {
      id,
      status,
      fullName,
      email,
      countryCode: "+966",
      phoneNumber,
      formattedPhoneNumber: `+966${phoneNumber}`,
      gender,
      createdAt,
      rejectionReason: status === "rejected" ? "Incomplete registration" : null,
    };
    return [id, member] as const;
  }),
);

export const mockDb = {
  getMe(): MockUser | null {
    return users.get("user_demo") ?? null;
  },

  getAuthMe(): MockStaffProfile | null {
    return authMeDemo;
  },

  updateAuthMeProfile(input: {
    fullName: string;
    countryCode: string;
    phoneNumber: string;
    avatar?: {
      id?: string | null;
      name?: string | null;
      publicUrl?: string | null;
    } | null;
  }): { email: string; id: string; fullName: string | null } {
    authMeDemo.fullName = input.fullName;
    authMeDemo.countryCode = input.countryCode;
    authMeDemo.phoneNumber = input.phoneNumber;
    authMeDemo.formattedPhoneNumber = `${input.countryCode}${input.phoneNumber}`;
    if (input.avatar) {
      authMeDemo.avatar = {
        __typename: "AuthAvatar",
        id: input.avatar.id || authMeDemo.avatar?.id || uid("avatar"),
        name: input.avatar.name ?? authMeDemo.avatar?.name ?? null,
        publicUrl: input.avatar.publicUrl ?? authMeDemo.avatar?.publicUrl ?? null,
      };
      authMeDemo.photoURL = input.avatar.publicUrl ?? authMeDemo.photoURL;
    }
    return {
      email: authMeDemo.email,
      id: authMeDemo.id,
      fullName: authMeDemo.fullName,
    };
  },

  createUser(input: {
    fullName: string;
    email: string;
    countryCode: string;
    phone: string;
    department: string;
  }): MockUser {
    const user: MockUser = {
      __typename: "User",
      id: uid("user"),
      email: input.email,
      fullName: input.fullName,
      department: input.department,
      role: "member",
    };
    users.set(user.id, user);
    return user;
  },

  listEvents(status?: MockEventStatus): MockEvent[] {
    const all = [...events.values()];
    if (!status) return all;
    return all.filter((event) => event.status === status);
  },

  eventList(input: {
    sort?: Array<{ field: string; order: "asc" | "desc" }> | null;
    pagination?: { limit: number; page: number } | null;
    filters?: Record<string, unknown> | null;
  }) {
    type ListStatus = "upcoming" | "live" | "completed";
    type ListRow = Record<string, unknown> & {
      id: string;
      name: string;
      date: string;
      startTime: string;
      endTime: string;
      brideName: string | null;
      groomName: string | null;
      hallCapacity: number | null;
      numberOfGuests: number | null;
      language: string | null;
      address: string | null;
      hallRef: string | null;
      googleMapUrl: string | null;
      eventHallIds: string[] | null;
      eventSeatMapIds: string[] | null;
      createdFrom: string | null;
      createdAt: string | null;
      updatedAt: string | null;
      createdBy: string | null;
      updatedBy: string | null;
      status: ListStatus;
    };

    const toListStatus = (status: MockEventStatus): ListStatus => {
      if (status === "ACTIVE") return "live";
      if (status === "PAST") return "completed";
      return "upcoming";
    };

    const matchesScalar = (raw: unknown, expected: unknown): boolean => {
      if (expected == null) return true;
      if (Array.isArray(expected)) {
        return expected.map(String).includes(String(raw ?? ""));
      }
      if (typeof expected === "number") {
        return Number(raw) === expected;
      }
      if (typeof expected === "object") {
        const range = expected as { start?: string | null; end?: string | null };
        const value = String(raw ?? "").slice(0, 10);
        if (range.start && value < range.start) return false;
        if (range.end && value > range.end) return false;
        return true;
      }
      return String(raw ?? "")
        .toLowerCase()
        .includes(String(expected).toLowerCase());
    };

    const rows: ListRow[] = [...events.values()].map((event) => ({
      id: event.id,
      name: event.name,
      eventType: event.eventType,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      brideName: event.brideName,
      groomName: event.groomName,
      hallCapacity: event.hallCapacity,
      numberOfGuests: event.expectedGuests,
      language: event.language,
      address: event.address,
      hallRef: event.hallReference ?? event.venueName,
      googleMapUrl: event.googleMapsUrl,
      eventHallIds: [],
      eventSeatMapIds: [],
      createdFrom: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
      createdBy: event.createdBy,
      updatedBy: null,
      status: toListStatus(event.status),
      ownerId: event.ownerId,
      owner: event.ownerId ? { id: event.ownerId, fullName: event.customerName || null } : null,
      venueName: event.venueName,
    }));

    const filterObject = input.filters ?? {};
    const filtered = rows.filter((row) =>
      Object.entries(filterObject).every(([field, value]) => {
        if (value == null || value === "") return true;
        if (field === "eventDateRange") return matchesScalar(row.date, value);
        if (field === "createdAtRange") return matchesScalar(row.createdAt, value);
        return matchesScalar(row[field], value);
      }),
    );

    const sorted = [...filtered];
    const sort = input.sort ?? [];
    if (sort.length > 0) {
      sorted.sort((a, b) => {
        for (const entry of sort) {
          const left = String(a[entry.field] ?? "");
          const right = String(b[entry.field] ?? "");
          if (left < right) return entry.order === "asc" ? -1 : 1;
          if (left > right) return entry.order === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    const limit = Math.max(1, input.pagination?.limit ?? 10);
    const page = Math.max(1, input.pagination?.page ?? 1);
    const totalCount = sorted.length;
    const totalPagesCount = Math.max(1, Math.ceil(totalCount / limit));
    const start = (page - 1) * limit;
    const pageRows = sorted.slice(start, start + limit).map(({ venueName: _venue, ...row }) => row);

    return {
      pageInfo: {
        hasNextPage: page < totalPagesCount,
        hasPreviousPage: page > 1,
        totalCount,
        pageSize: limit,
        page,
        totalPagesCount,
      },
      rows: pageRows,
    };
  },

  eventCreate(input: {
    address?: string | null;
    brideName: string;
    date: string;
    endTime: string;
    eventType: string;
    googleMapUrl?: string | null;
    groomName: string;
    hallCapacity?: number | null;
    hallRef?: string | null;
    name: string;
    numberOfGuests: number;
    language: string;
    ownerId?: string | null;
    startTime: string;
  }): { id: string; name: string } {
    const event = this.createEvent({
      name: input.name,
      brideName: input.brideName,
      groomName: input.groomName,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      venueName: input.address || input.hallRef || "",
      expectedGuests: input.numberOfGuests,
      eventType: input.eventType,
      language: input.language,
      status: "UPCOMING",
      createdBy: "APP",
      ownerId: input.ownerId ?? null,
      ...(input.address ? { address: input.address } : {}),
      ...(input.googleMapUrl ? { googleMapsUrl: input.googleMapUrl } : {}),
      ...(input.hallCapacity != null ? { hallCapacity: input.hallCapacity } : {}),
      ...(input.hallRef ? { hallReference: input.hallRef } : {}),
    });
    return { id: event.id, name: event.name };
  },

  eventTypeEnum(): Array<{ id: string; label: string }> {
    return [
      { id: "wedding", label: "Wedding" },
      { id: "engagement", label: "Engagement" },
      { id: "corporate", label: "Corporate" },
      { id: "other", label: "Other" },
    ];
  },

  eventFind(id: string) {
    const event = events.get(id);
    if (!event) return null;

    const toListStatus = (status: MockEventStatus): "upcoming" | "live" | "completed" => {
      if (status === "ACTIVE") return "live";
      if (status === "PAST") return "completed";
      return "upcoming";
    };

    const eventDateTime = `${event.date}T${event.startTime}:00`;
    const eventEndDateTime = `${event.date}T${event.endTime}:00`;

    return {
      id: event.id,
      name: event.name,
      eventType: event.eventType,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      eventDateTime,
      eventEndDateTime,
      status: toListStatus(event.status),
      brideName: event.brideName,
      groomName: event.groomName,
      hallCapacity: event.hallCapacity,
      numberOfGuests: event.expectedGuests,
      language: event.language,
      address: event.address,
      hallRef: event.hallReference ?? event.venueName,
      googleMapUrl: event.googleMapsUrl,
      eventHallIds: [] as string[],
      eventSeatMapIds: [] as string[],
      createdFrom: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
      createdBy: event.createdBy,
      updatedBy: null,
      ownerId: event.ownerId,
      owner: event.ownerId ? { id: event.ownerId, fullName: event.customerName || null } : null,
    };
  },

  eventSetupProgressFind(eventId: string) {
    const event = events.get(eventId);
    if (!event) return null;

    return {
      eventId,
      completedCount: 0,
      totalCount: 9,
      percentComplete: 0,
      hallSetup: { completed: false, hallIds: [] as string[] },
      guestList: {
        completed: false,
        guestCount: 0,
        numberOfGuests: event.expectedGuests,
      },
      seatMapping: { completed: false, eventSeatMapIds: [] as string[] },
      invitations: { completed: false },
      timeline: { completed: false },
      checkIn: { completed: false },
      abayaLabels: { completed: false },
      eventStaff: { completed: false },
      eventTables: {
        completed: false,
        numberOfGuests: event.expectedGuests,
        totalCapacity: event.hallCapacity ?? 0,
      },
    };
  },

  eventStatsFind(eventId: string) {
    const event = events.get(eventId);
    if (!event) return null;

    return {
      eventId,
      totalGuests: event.expectedGuests,
      expected: { count: event.expectedGuests, percent: "100%" },
      invitationsSent: { count: event.invitationCount, percent: "0%" },
      rsvpsConfirmed: { count: 0, percent: "0%" },
      checkedIn: { count: 0, percent: "0%" },
    };
  },

  eventAbayaLabelSetFind(eventId: string) {
    return abayaLabelSets.get(eventId) ?? null;
  },

  eventAbayaLabelGenerate(data: {
    eventId: string;
    prefix: string;
    suffix?: string | null;
    from: number;
    to: number;
  }) {
    const event = events.get(data.eventId);
    if (!event) throw new Error(`Event not found: ${data.eventId}`);

    const from = Math.trunc(data.from);
    const to = Math.trunc(data.to);
    const totalLabels = Math.max(0, to - from + 1);
    const now = new Date().toISOString();
    const existing = abayaLabelSets.get(data.eventId);
    const id = existing?.id ?? `abaya-${data.eventId}`;

    const row = {
      id,
      eventId: data.eventId,
      prefix: data.prefix,
      suffix: data.suffix ?? "",
      from,
      to,
      totalLabels,
      assignedLabels: 0,
      availableLabels: totalLabels,
      createdAt: existing?.createdAt ?? now,
      createdBy: "APP",
      updatedAt: now,
      updatedBy: "APP",
    };
    abayaLabelSets.set(data.eventId, row);
    return { id };
  },

  eventTablesList(args: {
    eventId: string;
    sort?: Array<{ field: string; order: "asc" | "desc" }> | null;
    pagination?: { limit: number; page: number } | null;
    filters?: {
      id?: string | null;
      name?: string | null;
      label?: string | null;
      tableNumber?: number | null;
      capacity?: number | null;
    } | null;
  }) {
    const hallIds = hallIdsByEvent.get(args.eventId) ?? [];
    const guests = guestsByEvent.get(args.eventId) ?? [];
    const seats = seatsByEvent.get(args.eventId) ?? [];

    let rows = hallIds.flatMap((hallId) => {
      const objects = (hallObjectsByHall.get(hallId) ?? []).filter(
        (object) => object.type === "table",
      );
      return objects.map((object, index) => {
        const parsedNumber = Number(object.label.match(/(\d+)/)?.[1]);
        const tableNumber = Number.isFinite(parsedNumber) ? parsedNumber : index + 1;
        const code = `T${tableNumber}`;
        const seatedGuestIds = new Set(
          seats.filter((seat) => seat.tableId === object.id).map((seat) => seat.guestId),
        );
        const assignedGuests = guests
          .filter(
            (guest) =>
              seatedGuestIds.has(guest.id) ||
              guest.tableId === object.id ||
              guest.tableId === code ||
              guest.tableId === object.label,
          )
          .map((guest) => ({
            id: guest.id,
            name: guest.name,
            email: guest.email,
          }));

        return {
          id: object.id,
          name: object.label,
          label: object.label,
          tableNumber,
          capacity: object.table?.capacity ?? 0,
          assignedGuests,
        };
      });
    });

    const filters = args.filters;
    if (filters?.id) rows = rows.filter((row) => row.id === filters.id);
    if (filters?.name) {
      const q = filters.name.toLowerCase();
      rows = rows.filter((row) => row.name.toLowerCase().includes(q));
    }
    if (filters?.label) {
      const q = filters.label.toLowerCase();
      rows = rows.filter((row) => row.label.toLowerCase().includes(q));
    }
    if (filters?.tableNumber != null) {
      rows = rows.filter((row) => row.tableNumber === filters.tableNumber);
    }
    if (filters?.capacity != null) {
      rows = rows.filter((row) => row.capacity === filters.capacity);
    }

    const sort = args.sort?.[0];
    if (sort) {
      const dir = sort.order === "desc" ? -1 : 1;
      rows = [...rows].sort((a, b) => {
        const left = a[sort.field as keyof typeof a];
        const right = b[sort.field as keyof typeof b];
        if (typeof left === "number" && typeof right === "number") return (left - right) * dir;
        return String(left ?? "").localeCompare(String(right ?? "")) * dir;
      });
    }

    const limit = args.pagination?.limit ?? 10;
    const page = args.pagination?.page ?? 1;
    const start = Math.max(0, (page - 1) * limit);
    const pageRows = rows.slice(start, start + limit);
    const totalCount = rows.length;
    const totalPagesCount = Math.max(1, Math.ceil(totalCount / limit) || 1);

    return {
      pageInfo: {
        hasNextPage: page < totalPagesCount,
        hasPreviousPage: page > 1,
        totalCount,
        pageSize: limit,
        page,
        totalPagesCount,
      },
      rows: pageRows,
    };
  },

  eventStaffList(args: {
    eventId: string;
    sort?: Array<{ field: string; order: "asc" | "desc" }> | null;
    pagination?: { limit: number; page: number } | null;
    filters?: {
      email?: string | null;
      fullName?: string | null;
      id?: string | null;
      phoneNumber?: string | null;
      role?: "staff" | "frontdesk" | null;
      createdAtRange?: { start?: string | null; end?: string | null } | null;
    } | null;
  }) {
    let rows = [...(eventStaffByEvent.get(args.eventId) ?? [])];
    const filters = args.filters;
    if (filters?.role) rows = rows.filter((row) => row.role === filters.role);
    if (filters?.email) {
      const q = filters.email.toLowerCase();
      rows = rows.filter((row) => row.email.toLowerCase().includes(q));
    }
    if (filters?.fullName) {
      const q = filters.fullName.toLowerCase();
      rows = rows.filter((row) => row.fullName.toLowerCase().includes(q));
    }
    if (filters?.phoneNumber) {
      const q = filters.phoneNumber.replace(/\D/g, "");
      rows = rows.filter((row) => row.phoneNumber.replace(/\D/g, "").includes(q));
    }
    if (filters?.id) rows = rows.filter((row) => row.id === filters.id);

    const limit = args.pagination?.limit ?? 10;
    const page = args.pagination?.page ?? 1;
    const start = Math.max(0, (page - 1) * limit);
    const pageRows = rows.slice(start, start + limit);
    const totalCount = rows.length;
    const totalPagesCount = Math.max(1, Math.ceil(totalCount / limit) || 1);

    return {
      pageInfo: {
        hasNextPage: page < totalPagesCount,
        hasPreviousPage: page > 1,
        totalCount,
        pageSize: limit,
        page,
        totalPagesCount,
      },
      rows: pageRows,
    };
  },

  eventStaffCreate(data: {
    eventId: string;
    role: "staff" | "frontdesk";
    note?: string | null;
    userId: string;
  }) {
    const event = events.get(data.eventId);
    if (!event) throw new Error(`Event not found: ${data.eventId}`);
    const now = new Date().toISOString();
    const id = `event-staff-${Date.now()}`;
    const row = {
      id,
      eventId: data.eventId,
      role: data.role,
      fullName: data.userId ? `Member ${data.userId.slice(0, 6)}` : "Staff Member",
      email: "",
      phoneNumber: "",
      formattedPhoneNumber: "",
      countryCode: "+966",
      note: data.note ?? "",
      createdAt: now,
      updatedAt: now,
    };
    const existing = eventStaffByEvent.get(data.eventId) ?? [];
    eventStaffByEvent.set(data.eventId, [row, ...existing]);
    return { id };
  },

  eventStaffDestroy(id: string) {
    for (const [eventId, rows] of eventStaffByEvent.entries()) {
      const next = rows.filter((row) => row.id !== id);
      if (next.length !== rows.length) {
        eventStaffByEvent.set(eventId, next);
        return { id };
      }
    }
    throw new Error(`Event staff not found: ${id}`);
  },

  eventUpdate(
    id: string,
    data: {
      address?: string | null;
      brideName?: string | null;
      date?: string | null;
      endTime?: string | null;
      eventType?: string | null;
      googleMapUrl?: string | null;
      groomName?: string | null;
      hallCapacity?: number | null;
      hallRef?: string | null;
      name?: string | null;
      numberOfGuests?: number | null;
      language?: string | null;
      ownerId?: string | null;
      startTime?: string | null;
    },
  ): { id: string; name: string } {
    const current = events.get(id);
    if (!current) throw new Error(`Event not found: ${id}`);

    const next: MockEvent = {
      ...current,
      name: data.name ?? current.name,
      brideName: data.brideName ?? current.brideName,
      groomName: data.groomName ?? current.groomName,
      date: data.date ?? current.date,
      startTime: data.startTime ?? current.startTime,
      endTime: data.endTime ?? current.endTime,
      expectedGuests: data.numberOfGuests ?? current.expectedGuests,
      eventType: data.eventType !== undefined ? data.eventType : current.eventType,
      language: data.language ?? current.language,
      hallCapacity: data.hallCapacity !== undefined ? data.hallCapacity : current.hallCapacity,
      hallReference: data.hallRef !== undefined ? data.hallRef : current.hallReference,
      address: data.address !== undefined ? data.address : current.address,
      googleMapsUrl: data.googleMapUrl !== undefined ? data.googleMapUrl : current.googleMapsUrl,
      ownerId: data.ownerId !== undefined ? data.ownerId : current.ownerId,
      venueName:
        data.address ||
        data.hallRef ||
        current.venueName ||
        current.address ||
        current.hallReference ||
        "",
    };
    events.set(id, next);
    return { id: next.id, name: next.name };
  },

  getEvent(id: string): MockEvent | null {
    return events.get(id) ?? null;
  },

  createEvent(input: CreateEventInput): MockEvent {
    const event: MockEvent = {
      __typename: "Event",
      id: uid("event"),
      name: input.name,
      brideName: input.brideName,
      groomName: input.groomName,
      customerName: input.customerName ?? "",
      ownerId: input.ownerId ?? null,
      createdBy: input.createdBy ?? "APP",
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      venueName: input.venueName,
      expectedGuests: input.expectedGuests,
      hallCapacity: input.hallCapacity ?? null,
      hallReference: input.hallReference ?? null,
      address: input.address ?? null,
      googleMapsUrl: input.googleMapsUrl ?? null,
      invitationCount: 0,
      status: input.status ?? "UPCOMING",
      eventType: input.eventType ?? null,
      language: input.language,
      createdAt: new Date().toISOString(),
    };
    events.set(event.id, event);
    return event;
  },

  updateEvent(id: string, input: UpdateEventInput): MockEvent {
    const current = events.get(id);
    if (!current) throw new Error(`Event not found: ${id}`);

    const patch = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as UpdateEventInput;

    const next: MockEvent = {
      ...current,
      ...patch,
      __typename: "Event",
      id: current.id,
      createdBy: current.createdBy,
      createdAt: current.createdAt,
      name: patch.name ?? current.name,
      brideName: patch.brideName ?? current.brideName,
      groomName: patch.groomName ?? current.groomName,
      customerName: patch.customerName ?? current.customerName,
      date: patch.date ?? current.date,
      startTime: patch.startTime ?? current.startTime,
      endTime: patch.endTime ?? current.endTime,
      venueName: patch.venueName ?? current.venueName,
      expectedGuests: patch.expectedGuests ?? current.expectedGuests,
      eventType: patch.eventType !== undefined ? patch.eventType : current.eventType,
      language: patch.language ?? current.language,
      status: patch.status ?? current.status,
      invitationCount: patch.invitationCount ?? current.invitationCount,
    };
    events.set(id, next);
    return next;
  },

  eventDestroy(id: string): { id: string } {
    if (!events.has(id)) throw new Error(`Event not found: ${id}`);
    events.delete(id);
    guestsByEvent.delete(id);
    return { id };
  },

  /** @deprecated Prefer `eventDestroy`. */
  deleteEvent(id: string): boolean {
    try {
      this.eventDestroy(id);
      return true;
    } catch {
      return false;
    }
  },

  listGuests(eventId: string): MockGuest[] {
    return [...(guestsByEvent.get(eventId) ?? [])];
  },

  eventGuestList(input: {
    eventId: string;
    sort?: Array<{ field: string; direction: "asc" | "desc" }> | null;
    pagination?: { limit: number; page: number } | null;
    filters?: {
      email?: string | null;
      formattedPhoneNumber?: string | null;
      gender?: EventGuestApiGender | null;
      id?: string | null;
      name?: string | null;
      status?: EventGuestApiStatus | null;
      createdAtRange?: { start?: string | null; end?: string | null } | null;
    } | null;
  }) {
    const toGender = (guest: MockGuest): EventGuestApiGender => {
      if (guest.apiGender) return guest.apiGender;
      if (guest.gender === "FEMALE") return "female";
      if (guest.gender === "MALE") return "male";
      return "NA";
    };
    const toStatus = (guest: MockGuest): EventGuestApiStatus => {
      if (guest.apiStatus) return guest.apiStatus;
      if (guest.rsvpStatus === "CONFIRMED") return "confirmed";
      return "expected";
    };
    const includes = (value: string | null | undefined, expected: string | null | undefined) => {
      if (!expected) return true;
      return String(value ?? "")
        .toLowerCase()
        .includes(expected.toLowerCase());
    };

    const rows = (guestsByEvent.get(input.eventId) ?? []).map((guest) => {
      const createdAt = guest.createdAt ?? "2026-01-01T00:00:00Z";
      const formattedPhoneNumber = guest.phone;
      const companionCount = guest.numberOfCompanions ?? 0;
      const companions =
        companionCount > 0
          ? Array.from({ length: companionCount }, (_, index) => ({
              id: `${guest.id}-companion-${index + 1}`,
              name: `${guest.name} Companion ${index + 1}`,
              email: null as string | null,
            }))
          : [];
      return {
        id: guest.id,
        eventId: guest.eventId,
        name: guest.name,
        email: guest.email,
        gender: toGender(guest),
        phoneNumber: guest.phone,
        countryCode: guest.countryCode ?? null,
        formattedPhoneNumber,
        status: toStatus(guest),
        parentGuestId: null,
        numberOfCompanions: companionCount,
        companions,
        invitationSent: Boolean(guest.code),
        checkedIn: Boolean(guest.checkedInAt),
        qrCode: guest.code ? { id: `qr-${guest.id}`, name: guest.code, publicUrl: null } : null,
        abayaLabelId: guest.abayaLabel ?? null,
        abayaLabel: guest.abayaLabel ? { id: guest.abayaLabel } : null,
        code: guest.code,
        seatId: guest.seatId,
        seatNumber: guest.seatId,
        tableNumber: guest.tableId,
        createdAt,
        updatedAt: guest.updatedAt ?? createdAt,
        updatedBy: null,
      };
    });

    const filters = input.filters ?? {};
    const filtered = rows.filter((row) => {
      if (!includes(row.email, filters.email)) return false;
      if (!includes(row.name, filters.name)) return false;
      if (!includes(row.id, filters.id)) return false;
      if (
        filters.formattedPhoneNumber &&
        !includes(row.formattedPhoneNumber, filters.formattedPhoneNumber) &&
        !includes(row.phoneNumber, filters.formattedPhoneNumber)
      ) {
        return false;
      }
      if (filters.gender && row.gender !== filters.gender) return false;
      if (filters.status && row.status !== filters.status) return false;
      const range = filters.createdAtRange;
      if (range?.start && row.createdAt < range.start) return false;
      if (range?.end && row.createdAt > range.end) return false;
      return true;
    });

    const sorted = [...filtered];
    for (const entry of input.sort ?? []) {
      sorted.sort((left, right) => {
        const a = String((left as Record<string, unknown>)[entry.field] ?? "");
        const b = String((right as Record<string, unknown>)[entry.field] ?? "");
        if (a < b) return entry.direction === "asc" ? -1 : 1;
        if (a > b) return entry.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    const limit = Math.max(1, input.pagination?.limit ?? 10);
    const page = Math.max(1, input.pagination?.page ?? 1);
    const totalCount = sorted.length;
    const totalPagesCount = Math.max(1, Math.ceil(totalCount / limit));
    const start = (page - 1) * limit;

    return {
      pageInfo: {
        hasNextPage: page < totalPagesCount,
        hasPreviousPage: page > 1,
        totalCount,
        pageSize: limit,
        page,
        totalPagesCount,
      },
      rows: sorted.slice(start, start + limit),
    };
  },

  eventGuestCreate(data: {
    countryCode: string;
    email?: string | null;
    eventId: string;
    gender: EventGuestApiGender;
    name?: string | null;
    numberOfCompanions: number;
    phoneNumber: string;
  }) {
    const gender = data.gender === "female" ? "FEMALE" : data.gender === "male" ? "MALE" : null;
    const guest: MockGuest = {
      __typename: "Guest",
      id: uid("guest"),
      eventId: data.eventId,
      name: data.name?.trim() || "",
      familyName: null,
      email: data.email ?? null,
      phone: data.phoneNumber,
      gender,
      code: null,
      abayaLabel: null,
      rsvpStatus: "UNCONFIRMED",
      groupId: null,
      hallId: null,
      seatId: null,
      tableId: null,
      checkedInAt: null,
      checkedOutAt: null,
      countryCode: data.countryCode,
      apiGender: data.gender,
      apiStatus: "expected",
      numberOfCompanions: data.numberOfCompanions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = guestsByEvent.get(data.eventId) ?? [];
    list.push(guest);
    guestsByEvent.set(data.eventId, list);
    return { id: guest.id, email: guest.email };
  },

  eventGuestUpdate(
    id: string,
    data: {
      countryCode?: string;
      email?: string | null;
      gender?: EventGuestApiGender;
      name?: string | null;
      numberOfCompanions?: number;
      phoneNumber?: string;
    },
  ) {
    for (const [eventId, list] of guestsByEvent.entries()) {
      const index = list.findIndex((guest) => guest.id === id);
      if (index < 0) continue;
      const current = list[index]!;
      const next: MockGuest = { ...current, updatedAt: new Date().toISOString() };
      if (data.name !== undefined) next.name = data.name ?? "";
      if (data.email !== undefined) next.email = data.email;
      if (data.phoneNumber !== undefined) next.phone = data.phoneNumber;
      if (data.countryCode !== undefined) next.countryCode = data.countryCode;
      if (data.gender !== undefined) {
        next.apiGender = data.gender;
        next.gender = data.gender === "female" ? "FEMALE" : data.gender === "male" ? "MALE" : null;
      }
      if (data.numberOfCompanions !== undefined) next.numberOfCompanions = data.numberOfCompanions;
      list[index] = next;
      guestsByEvent.set(eventId, list);
      return { id: next.id, name: next.name || null };
    }
    throw new Error(`Guest not found: ${id}`);
  },

  eventGuestDestroy(id: string) {
    for (const [eventId, list] of guestsByEvent.entries()) {
      const index = list.findIndex((guest) => guest.id === id);
      if (index < 0) continue;
      const [removed] = list.splice(index, 1);
      guestsByEvent.set(eventId, list);
      return { id, email: removed?.email ?? null };
    }
    throw new Error(`Guest not found: ${id}`);
  },

  eventGuestCheckIn(eventId: string, code: string) {
    const list = guestsByEvent.get(eventId) ?? [];
    const guest = list.find(
      (entry) => entry.code?.toLowerCase() === code.trim().toLowerCase() || entry.id === code,
    );
    if (!guest) throw new Error(`Guest not found for code: ${code}`);
    guest.checkedInAt = new Date().toISOString();
    guest.checkedOutAt = null;
    return {
      guest: {
        id: guest.id,
        name: guest.name,
      },
    };
  },

  eventGuestFindByCode(eventId: string, code: string) {
    const list = guestsByEvent.get(eventId) ?? [];
    const guest = list.find(
      (entry) => entry.code?.toLowerCase() === code.trim().toLowerCase() || entry.id === code,
    );
    if (!guest) return null;
    return {
      id: guest.id,
      name: guest.name,
      email: guest.email,
    };
  },

  createGuest(input: CreateGuestInput): MockGuest {
    const guest: MockGuest = {
      __typename: "Guest",
      id: uid("guest"),
      eventId: input.eventId,
      name: input.name,
      familyName: input.familyName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      gender: input.gender ?? null,
      code: input.code ?? null,
      abayaLabel: input.abayaLabel ?? null,
      rsvpStatus: input.rsvpStatus ?? "UNCONFIRMED",
      groupId: input.groupId ?? null,
      hallId: null,
      seatId: null,
      tableId: null,
      checkedInAt: null,
      checkedOutAt: null,
    };
    const list = guestsByEvent.get(input.eventId) ?? [];
    list.push(guest);
    guestsByEvent.set(input.eventId, list);
    return guest;
  },

  updateGuest(
    id: string,
    input: Partial<{
      name: string | null;
      familyName: string | null;
      email: string | null;
      phone: string | null;
      gender: "MALE" | "FEMALE" | null;
      code: string | null;
      abayaLabel: string | null;
      rsvpStatus: "CONFIRMED" | "MAYBE" | "UNCONFIRMED" | null;
      groupId: string | null;
    }>,
  ): MockGuest {
    for (const [eventId, list] of guestsByEvent.entries()) {
      const index = list.findIndex((guest) => guest.id === id);
      if (index < 0) continue;
      const current = list[index]!;
      const next: MockGuest = {
        ...current,
        ...Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)),
        __typename: "Guest",
        id: current.id,
        eventId: current.eventId,
      };
      list[index] = next;
      guestsByEvent.set(eventId, list);
      return next;
    }
    throw new Error(`Guest not found: ${id}`);
  },

  bulkImportGuests(
    eventId: string,
    rows: Omit<CreateGuestInput, "eventId" | "rsvpStatus" | "groupId">[],
  ) {
    const guests = rows.map((row) =>
      this.createGuest({
        eventId,
        ...row,
        rsvpStatus: "UNCONFIRMED",
      }),
    );
    return {
      __typename: "BulkImportGuestsPayload" as const,
      message: `Imported ${guests.length} guest(s) successfully.`,
      importedCount: guests.length,
      guests,
      errors: [] as Array<{ row?: number | null; field?: string | null; message: string }>,
    };
  },

  dashboardOverview() {
    return {
      __typename: "DashboardOverview" as const,
      upcomingEvents: [
        {
          __typename: "EventSummary" as const,
          id: "evt_1",
          name: "Al-Rashid Wedding",
          date: "2026-09-20",
          guestCount: 240,
        },
      ],
      totalGuests: 240,
      eventsThisWeek: 2,
    };
  },

  eventHallList(eventId: string) {
    const ids = hallIdsByEvent.get(eventId) ?? [];
    return ids
      .map((id) => hallsById.get(id))
      .filter((hall): hall is MockEventHall => Boolean(hall))
      .map((hall) => decorateHall(hall));
  },

  eventHallFind(id: string) {
    const hall = hallsById.get(id);
    return hall ? decorateHall(hall) : null;
  },

  eventHallCreate(input: CreateEventHallInput): { id: string; eventId: string; name: string } {
    const id = uid("hall");
    const now = new Date().toISOString();
    const hall: MockEventHall = {
      id,
      eventId: input.eventId,
      name: input.name,
      status: input.status ?? null,
      layoutVersion: 1,
      coordinateSystem: {
        width: input.coordinateSystem.width,
        height: input.coordinateSystem.height,
      },
      boundary: {
        shape: input.boundary.shape,
        x: input.boundary.x,
        y: input.boundary.y,
        width: input.boundary.width,
        height: input.boundary.height,
        radius: input.boundary.radius ?? null,
        points: input.boundary.points ? input.boundary.points.map((point) => ({ ...point })) : null,
      },
      tableTemplates: input.tableTemplates.map((template) => ({
        id: uid("tpl"),
        capacity: template.capacity,
        numberOfTables: template.numberOfTables,
        seatNaming: template.seatNaming,
        tableNaming: template.tableNaming,
        tableShape: template.tableShape,
      })),
      createdAt: now,
      updatedAt: now,
      createdBy: "APP",
      updatedBy: null,
    };
    hallsById.set(id, hall);
    const existing = hallIdsByEvent.get(input.eventId) ?? [];
    hallIdsByEvent.set(input.eventId, [...existing, id]);
    return { id: hall.id, eventId: hall.eventId, name: hall.name };
  },

  eventHallUpdate(
    id: string,
    data: UpdateEventHallInput,
  ): {
    id: string;
    name: string;
    layoutVersion: number;
    status: string | null;
  } {
    const current = hallsById.get(id);
    if (!current) throw new Error(`Event hall not found: ${id}`);

    const next: MockEventHall = {
      ...current,
      name: data.name ?? current.name,
      status: data.status !== undefined ? data.status : current.status,
      layoutVersion: current.layoutVersion + 1,
      updatedAt: new Date().toISOString(),
      coordinateSystem: data.coordinateSystem
        ? { width: data.coordinateSystem.width, height: data.coordinateSystem.height }
        : current.coordinateSystem,
      boundary: data.boundary
        ? {
            shape: data.boundary.shape,
            x: data.boundary.x,
            y: data.boundary.y,
            width: data.boundary.width,
            height: data.boundary.height,
            radius: data.boundary.radius ?? null,
            points: data.boundary.points
              ? data.boundary.points.map((point) => ({ ...point }))
              : null,
          }
        : current.boundary,
      tableTemplates: data.tableTemplates
        ? data.tableTemplates.map((template, index) => {
            const previous = current.tableTemplates[index];
            return {
              id: previous?.id ?? uid("tpl"),
              capacity: template.capacity,
              numberOfTables: template.numberOfTables,
              seatNaming: template.seatNaming,
              tableNaming: template.tableNaming,
              tableShape: template.tableShape,
            };
          })
        : current.tableTemplates,
    };
    hallsById.set(id, next);
    return {
      id: next.id,
      name: next.name,
      layoutVersion: next.layoutVersion,
      status: next.status,
    };
  },

  eventHallObjectList(eventId: string, eventHallId: string) {
    return (hallObjectsByHall.get(eventHallId) ?? []).filter(
      (object) => object.eventId === eventId,
    );
  },

  eventHallObjectSaveAll(data: {
    eventHallId: string;
    eventId: string;
    objects: Array<{
      id?: string | null;
      templateId?: string | null;
      table?: { capacity: number; shape: string; number?: number } | null;
      label: string;
      type: string;
      transform: MockHallObject["transform"];
      geometry?: string | null;
    }>;
  }) {
    const now = new Date().toISOString();
    const previous = hallObjectsByHall.get(data.eventHallId) ?? [];
    const previousById = new Map(previous.map((object) => [object.id, object]));
    const reservedByKey = new Map(
      previous
        .filter((object) => object.table)
        .map((object) => [
          `${object.templateId ?? ""}:${object.label}:${object.transform.x}:${object.transform.y}`,
          object.table?.reservedSeats ?? 0,
        ]),
    );
    const saved: MockHallObject[] = data.objects.map((object) => {
      const existing = object.id ? previousById.get(object.id) : undefined;
      const key = `${object.templateId ?? ""}:${object.label}:${object.transform.x}:${object.transform.y}`;
      return {
        id: existing?.id ?? uid("obj"),
        eventId: data.eventId,
        eventHallId: data.eventHallId,
        templateId: object.templateId ?? null,
        label: object.label,
        type: object.type,
        geometry: object.geometry ?? "box",
        table: object.table
          ? {
              capacity: object.table.capacity,
              reservedSeats: existing?.table?.reservedSeats ?? reservedByKey.get(key) ?? 0,
              shape: object.table.shape,
            }
          : null,
        transform: { ...object.transform },
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        updatedBy: "APP",
        createdBy: existing?.createdBy ?? "APP",
      };
    });
    hallObjectsByHall.set(data.eventHallId, saved);
    return saved.map((object) => ({
      id: object.id,
      updatedAt: object.updatedAt,
      eventHallId: object.eventHallId,
      eventId: object.eventId,
    }));
  },

  eventHallObjectDestroy(id: string) {
    for (const [hallId, objects] of hallObjectsByHall) {
      const match = objects.find((object) => object.id === id);
      if (!match) continue;
      hallObjectsByHall.set(
        hallId,
        objects.filter((object) => object.id !== id),
      );
      return { id: match.id, label: match.label };
    }
    throw new Error(`Hall object not found: ${id}`);
  },

  eventSeatSaveAll(data: {
    eventId: string;
    eventHallId: string;
    seats: Array<{ guestId: string; seatIndex: number; tableId: string }>;
  }) {
    const seats = data.seats.map((seat) => ({
      id: uid("seat"),
      eventId: data.eventId,
      hallId: data.eventHallId,
      tableId: seat.tableId,
      seatIndex: seat.seatIndex,
      guestId: seat.guestId,
    }));
    seatsByEvent.set(data.eventId, seats);

    const guests = guestsByEvent.get(data.eventId) ?? [];
    const seatByGuest = new Map(seats.map((seat) => [seat.guestId, seat.id]));
    guestsByEvent.set(
      data.eventId,
      guests.map((guest) => ({
        ...guest,
        seatId: seatByGuest.get(guest.id) ?? guest.seatId,
        tableId: seatByGuest.has(guest.id)
          ? (seats.find((seat) => seat.guestId === guest.id)?.tableId ?? guest.tableId)
          : guest.tableId,
        hallId: seatByGuest.has(guest.id) ? data.eventHallId : guest.hallId,
      })),
    );

    for (const [hallId, objects] of hallObjectsByHall) {
      if (hallId !== data.eventHallId) continue;
      const reservedByTable = new Map<string, number>();
      for (const seat of seats) {
        reservedByTable.set(seat.tableId, (reservedByTable.get(seat.tableId) ?? 0) + 1);
      }
      hallObjectsByHall.set(
        hallId,
        objects.map((object) => {
          if (!object.table) return object;
          return {
            ...object,
            table: {
              ...object.table,
              reservedSeats: reservedByTable.get(object.id) ?? 0,
            },
          };
        }),
      );
    }

    return seats.map((seat) => ({
      id: seat.id,
      hallId: seat.hallId,
      eventId: seat.eventId,
    }));
  },

  eventSeatUnassign(data: { eventId: string; seatId: string }) {
    const seats = seatsByEvent.get(data.eventId) ?? [];
    const match = seats.find((seat) => seat.id === data.seatId);
    if (!match) throw new Error(`Seat not found: ${data.seatId}`);
    const next = seats.filter((seat) => seat.id !== data.seatId);
    seatsByEvent.set(data.eventId, next);

    const guests = guestsByEvent.get(data.eventId) ?? [];
    guestsByEvent.set(
      data.eventId,
      guests.map((guest) =>
        guest.id === match.guestId || guest.seatId === data.seatId
          ? { ...guest, seatId: null, tableId: null, hallId: null }
          : guest,
      ),
    );

    const objects = hallObjectsByHall.get(match.hallId) ?? [];
    hallObjectsByHall.set(
      match.hallId,
      objects.map((object) => {
        if (object.id !== match.tableId || !object.table) return object;
        return {
          ...object,
          table: {
            ...object.table,
            reservedSeats: Math.max(0, object.table.reservedSeats - 1),
          },
        };
      }),
    );

    return { id: match.id };
  },

  eventTableRoster(tableId: string) {
    for (const [hallId, objects] of hallObjectsByHall) {
      const table = objects.find((object) => object.id === tableId);
      if (!table) continue;
      const eventId = table.eventId;
      const seats = (seatsByEvent.get(eventId) ?? []).filter((seat) => seat.tableId === tableId);
      const guests = guestsByEvent.get(eventId) ?? [];
      return {
        seats: seats.map((seat) => {
          const guest = guests.find((entry) => entry.id === seat.guestId);
          return {
            id: seat.id,
            seatIndex: seat.seatIndex,
            guestId: seat.guestId,
            hallId: hallId,
            guest: guest ? { id: guest.id, name: guest.name } : null,
          };
        }),
        table: {
          id: table.id,
          label: table.label,
          table: table.table
            ? {
                capacity: table.table.capacity,
                reservedSeats: table.table.reservedSeats,
                shape: table.table.shape,
              }
            : null,
        },
      };
    }
    return null;
  },

  eventGuestSeatMapList(eventId: string) {
    const guests = guestsByEvent.get(eventId) ?? [];
    const byFamily = new Map<string, MockGuest[]>();
    const individuals: MockGuest[] = [];
    for (const guest of guests) {
      const family = guest.familyName?.trim();
      if (!family) {
        individuals.push(guest);
        continue;
      }
      const list = byFamily.get(family) ?? [];
      list.push(guest);
      byFamily.set(family, list);
    }

    const groups = [...byFamily.entries()].map(([family, members]) => {
      const parent = members[0]!;
      return {
        id: `group-${family}`,
        count: members.length,
        parent: { id: parent.id, name: parent.name || family, seatId: parent.seatId },
        members: members.map((member) => ({
          id: member.id,
          name: member.name,
          seatId: member.seatId,
        })),
      };
    });

    return {
      groups,
      individuals: individuals.map((guest) => ({
        id: guest.id,
        name: guest.name,
        seatId: guest.seatId,
      })),
    };
  },

  frontDeskList(input: {
    sort?: Array<{ field: string; order: "asc" | "desc" }> | null;
    pagination?: { limit: number; page: number } | null;
    filters?: Record<string, unknown> | null;
  }) {
    const matchesScalar = (raw: unknown, expected: unknown): boolean => {
      if (expected == null || expected === "") return true;
      if (Array.isArray(expected)) {
        return expected.map(String).includes(String(raw ?? ""));
      }
      if (typeof expected === "object") {
        const range = expected as { start?: string | null; end?: string | null };
        const value = String(raw ?? "").slice(0, 10);
        const start = range.start?.slice(0, 10);
        const end = range.end?.slice(0, 10);
        if (start && value < start) return false;
        if (end && value > end) return false;
        return true;
      }
      return String(raw ?? "")
        .toLowerCase()
        .includes(String(expected).toLowerCase());
    };

    const rows = [...frontDeskMembers.values()];
    const filterObject = input.filters ?? {};
    const filtered = rows.filter((row) =>
      Object.entries(filterObject).every(([field, value]) => {
        if (value == null || value === "") return true;
        if (field === "createdAtRange") return matchesScalar(row.createdAt, value);
        return matchesScalar(row[field as keyof MockFrontDesk], value);
      }),
    );

    const sorted = [...filtered];
    const sort = input.sort ?? [];
    if (sort.length > 0) {
      sorted.sort((a, b) => {
        for (const entry of sort) {
          const left = String(a[entry.field as keyof MockFrontDesk] ?? "");
          const right = String(b[entry.field as keyof MockFrontDesk] ?? "");
          if (left < right) return entry.order === "asc" ? -1 : 1;
          if (left > right) return entry.order === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    const limit = Math.max(1, input.pagination?.limit ?? 10);
    const page = Math.max(1, input.pagination?.page ?? 1);
    const totalCount = sorted.length;
    const totalPagesCount = Math.max(1, Math.ceil(totalCount / limit));
    const start = (page - 1) * limit;

    return {
      pageInfo: {
        hasNextPage: page < totalPagesCount,
        hasPreviousPage: page > 1,
        totalCount,
        pageSize: limit,
        page,
        totalPagesCount,
      },
      rows: sorted.slice(start, start + limit).map((member) => ({
        id: member.id,
        status: member.status,
        fullName: member.fullName,
        email: member.email,
        countryCode: member.countryCode,
        formattedPhoneNumber: member.formattedPhoneNumber,
      })),
    };
  },

  frontDeskCreate(data: {
    countryCode: string;
    email: string;
    fullName: string;
    phoneNumber: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const existing = [...frontDeskMembers.values()].find((member) => member.email === email);
    if (existing) throw new Error("A front desk member with this email already exists");

    const member: MockFrontDesk = {
      id: uid("fd"),
      status: "pending",
      fullName: data.fullName.trim(),
      email,
      countryCode: data.countryCode,
      phoneNumber: data.phoneNumber.trim(),
      formattedPhoneNumber: `${data.countryCode}${data.phoneNumber.trim()}`,
      gender: null,
      createdAt: new Date().toISOString(),
      rejectionReason: null,
    };
    frontDeskMembers.set(member.id, member);
    return { email: member.email };
  },

  frontDeskApprove(id: string) {
    const member = frontDeskMembers.get(id);
    if (!member) throw new Error(`Front desk member not found: ${id}`);
    member.status = "active";
    member.rejectionReason = null;
    return true;
  },

  frontDeskReject(id: string, reason: string) {
    const member = frontDeskMembers.get(id);
    if (!member) throw new Error(`Front desk member not found: ${id}`);
    member.status = "rejected";
    member.rejectionReason = reason.trim();
    return true;
  },

  userUpdate(
    id: string,
    data: {
      countryCode?: string | null;
      email?: string | null;
      fullName?: string | null;
      phoneNumber?: string | null;
    },
  ) {
    const member = frontDeskMembers.get(id);
    const user = users.get(id);
    if (!member && !user) throw new Error(`User not found: ${id}`);

    if (member) {
      if (data.fullName != null) member.fullName = data.fullName.trim();
      if (data.email != null) member.email = data.email.trim().toLowerCase();
      if (data.countryCode != null) member.countryCode = data.countryCode;
      if (data.phoneNumber != null) member.phoneNumber = data.phoneNumber.trim();
      member.formattedPhoneNumber = `${member.countryCode}${member.phoneNumber}`;
    }
    if (user) {
      if (data.fullName != null) user.fullName = data.fullName.trim();
      if (data.email != null) user.email = data.email.trim().toLowerCase();
    }

    return {
      email: member?.email ?? user?.email ?? "",
      fullName: member?.fullName ?? user?.fullName ?? null,
    };
  },

  userAssignRole(id: string, roleIds: string[]) {
    const user = users.get(id);
    if (!user) throw new Error(`User not found: ${id}`);
    if (roleIds.length === 0) throw new Error("At least one role is required");
    return {
      id: user.id,
      fullName: user.fullName ?? null,
    };
  },

  userDestroy(id: string) {
    const frontDesk = frontDeskMembers.get(id);
    const user = users.get(id);
    if (!frontDesk && !user) throw new Error(`User not found: ${id}`);

    const email = frontDesk?.email ?? user?.email ?? "";
    frontDeskMembers.delete(id);
    users.delete(id);
    return { id, email };
  },

  setUserStatus(id: string, status: "active" | "inactive") {
    const member = frontDeskMembers.get(id);
    if (member) {
      member.status = status;
      return true;
    }
    if (users.has(id)) return true;
    throw new Error(`User not found: ${id}`);
  },
};
