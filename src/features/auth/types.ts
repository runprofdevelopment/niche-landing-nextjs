export type AuthProfileType = "guest" | "staff" | "frontdesk";

export type MeAvatar = {
  id: string;
  name?: string | null;
  publicUrl?: string | null;
};

export type MeProfile = {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName?: string | null;
  countryCode?: string | null;
  formattedPhoneNumber?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  profileType: AuthProfileType;
  status?: string | null;
  provider?: string | null;
  internalId?: string | null;
  avatar?: MeAvatar | null;
  /** Staff only — owners bypass the permissions array. */
  isOwner?: boolean;
  /** Permission keys from backend (`event.view`, `guest.create`, …). */
  permissions?: string[] | null;
  roles?: string[] | null;
  roleIds?: string[] | null;
  /** Legacy createUser fields (registration). */
  department?: string | null;
  role?: string | null;
};

export type RegisterUserInput = {
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  department: string;
};

/** Owners or staff with at least one assigned role may use the dashboard. */
export function hasAssignedRoles(profile: MeProfile | null | undefined): boolean {
  return (profile?.roleIds?.length ?? 0) > 0 || profile?.isOwner === true;
}

/**
 * Verified staff waiting for an admin to assign roles
 * (not owners, empty `roleIds`).
 */
export function isPendingApproval(profile: MeProfile | null | undefined): boolean {
  return Boolean(
    profile?.emailVerified && profile.profileType === "staff" && !hasAssignedRoles(profile),
  );
}

/** Staff may enter the dashboard after email verification and role assignment (or ownership). */
export function canAccessDashboard(profile: MeProfile | null | undefined): boolean {
  return Boolean(
    profile?.emailVerified && profile.profileType === "staff" && hasAssignedRoles(profile),
  );
}
