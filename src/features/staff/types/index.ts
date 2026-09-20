export type StaffStatus = "active" | "inactive";

/** Whether a staff member is an approved account or an unreviewed join request. */
export type StaffState = "pending" | "active";

/** A role assigned to a staff member. Staff can hold several at once. */
export type StaffAssignedRole = {
  id: string;
  name: string;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  roles: StaffAssignedRole[];
  department: string;
  status: StaffStatus;
  state: StaffState;
};

export type StaffPermissionAudit = {
  id: string;
  key: string;
  description: string;
  moduleName: string;
};

export type StaffDetails = {
  id: string;
  name: string;
  status: StaffStatus;
  accountAge: string;
  lastLogin: string;
  rolesCount: number;
  permissionsCount: number;
  employeeId: string;
  email: string;
  phoneNumber: string;
  dateJoined: string;
  createdBy: string;
  isActive: boolean;
  roles: StaffAssignedRole[];
};

export type StaffFormInitialData = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  /** ISO 3166-1 alpha-2, e.g. `"SA"`. */
  countryCode: string;
  roleIds: string[];
  /** Labels for the assigned roles so chips render before the role page loads. */
  roles: StaffAssignedRole[];
  department: string;
  isActive: boolean;
  /** Download URL — preview only. Prefer `avatar` for mutations. */
  profilePhotoUrl: string | null;
  /** Avatar payload for create/update (`id` / `name` / `publicUrl`). */
  avatar: {
    id?: string | null;
    name?: string | null;
    publicUrl?: string | null;
    privateUrl?: string | null;
    new?: boolean | null;
    sizeInBytes?: number | null;
  } | null;
};
