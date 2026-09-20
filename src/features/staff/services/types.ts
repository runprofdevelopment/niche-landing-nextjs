import type { FilterInput, StaffDepartment } from "./graphql-types";

/** @deprecated Prefer `StaffUserFilterInput` from `../graphql`. */
export type StaffFilterInput = FilterInput;

export type StaffSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type StaffRole = {
  id: string;
  name: string;
};

/** Row shape returned by staff list, after mapping. */
export type StaffMemberRecord = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
  department: string | null;
  status: string;
  reviewStatus: string;
  createdAt: string;
  roles: StaffRole[];
  isOwner: boolean;
};

export type StaffPageInfo = {
  pagesCount: number;
  previousCursor: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

/** @deprecated Prefer `CreateStaffInput` from `use-create-staff`. */
export type CreateStaffInput = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  roleIds: string[];
  status?: "ACTIVE" | "INACTIVE" | "REJECTED";
  profilePhotoUrl?: string | null;
  department?: StaffDepartment;
};
