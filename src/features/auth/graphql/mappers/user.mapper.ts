import type { MeProfile } from "../../types";
import type { AuthMeBaseNode } from "../queries/auth-me";
import type { CreateUserMutation } from "@/lib/graphql/generated/graphql";

type CreateUserNode = CreateUserMutation["createUser"];

function isStaffProfile(user: AuthMeBaseNode): boolean {
  return user.__typename === "StaffProfile" || user.profileType === "staff";
}

export function mapAuthMeFromApi(user: AuthMeBaseNode): MeProfile {
  const base: MeProfile = {
    id: user.id,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    profileType: user.profileType,
    ...(user.fullName ? { fullName: user.fullName } : {}),
    ...(user.countryCode ? { countryCode: user.countryCode } : {}),
    ...(user.formattedPhoneNumber ? { formattedPhoneNumber: user.formattedPhoneNumber } : {}),
    ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
    ...(user.photoURL ? { photoURL: user.photoURL } : {}),
    ...(user.status ? { status: user.status } : {}),
    ...(user.provider ? { provider: user.provider } : {}),
    ...(user.internalId ? { internalId: user.internalId } : {}),
    ...(user.avatar
      ? {
          avatar: {
            id: user.avatar.id,
            ...(user.avatar.name ? { name: user.avatar.name } : {}),
            ...(user.avatar.publicUrl ? { publicUrl: user.avatar.publicUrl } : {}),
          },
        }
      : {}),
  };

  if (isStaffProfile(user)) {
    return {
      ...base,
      isOwner: Boolean(user.isOwner),
      permissions: user.permissions ?? [],
      ...(user.roles ? { roles: user.roles } : {}),
      ...(user.roleIds ? { roleIds: user.roleIds } : {}),
    };
  }

  return base;
}

/** Maps the thinner createUser payload used during registration. */
export function mapUserFromApi(user: CreateUserNode): MeProfile {
  return {
    id: user.id,
    email: user.email,
    emailVerified: false,
    profileType: "staff",
    isOwner: false,
    permissions: [],
    ...(user.fullName ? { fullName: user.fullName } : {}),
    ...(user.department ? { department: user.department } : {}),
    ...(user.role ? { role: user.role } : {}),
  };
}
