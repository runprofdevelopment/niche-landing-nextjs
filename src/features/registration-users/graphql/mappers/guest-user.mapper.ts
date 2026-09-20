import type { GuestType } from "../../constants";
import type { RegistrationUser, RegistrationUserDetails } from "../../types";
import type { GuestUserNode } from "../queries/guest-list";

function fallbackText(value: string | null | undefined) {
  return value?.trim() || "—";
}

function formatRegisteredAt(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeGuestType(
  value: string | null | undefined,
  isOwner?: boolean | null,
): GuestType {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "owner") return "owner";
  if (normalized === "guest") return "guest";
  return isOwner === true ? "owner" : "guest";
}

export function mapGuestUserToListItem(node: GuestUserNode): RegistrationUser {
  return {
    id: node.id,
    name: fallbackText(node.fullName),
    email: fallbackText(node.email),
    phoneNumber: fallbackText(node.formattedPhoneNumber ?? node.phoneNumber),
    guestType: normalizeGuestType(node.guestType, node.isOwner),
    registeredAt: formatRegisteredAt(node.updatedAt),
    avatarUrl: node.avatar?.publicUrl ?? null,
    status: node.status ?? "active",
  };
}

export function mapGuestUserToDetails(node: GuestUserNode): RegistrationUserDetails {
  return {
    id: node.id,
    name: fallbackText(node.fullName),
    email: fallbackText(node.email),
    phoneNumber: fallbackText(node.formattedPhoneNumber ?? node.phoneNumber),
    guestType: normalizeGuestType(node.guestType, node.isOwner),
    registeredAt: formatRegisteredAt(node.createdAt ?? node.updatedAt),
    avatarUrl: node.avatar?.publicUrl ?? null,
    status: node.status ?? "active",
    emailVerified: Boolean(node.emailVerified),
    countryCode: fallbackText(node.countryCode),
    profileType: fallbackText(node.profileType),
  };
}

export function getInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0 || name === "—") return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}
