export type RegistrationUsersTab = "guest" | "owner";

export type GuestType = "guest" | "owner";

export const REGISTRATION_USERS_TABS = [
  { value: "guest" as const, labelKey: "tabRegistrationUsers" as const },
  { value: "owner" as const, labelKey: "tabOwners" as const },
];

export const GUEST_TYPE_LABEL_KEYS = {
  guest: "accountTypeGuest",
  owner: "accountTypeOwner",
} as const satisfies Record<GuestType, "accountTypeGuest" | "accountTypeOwner">;
