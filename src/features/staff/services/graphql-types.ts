/**
 * Local, mock-friendly stand-ins for the GraphQL types that staff hooks and
 * mappers used to import from `@/lib/graphql/generated/graphql`.
 *
 * The generated schema currently has no Staff/Role types, so we mirror the
 * shape the mappers expect until codegen catches up. Keep these in sync with
 * the `.graphql` files under `src/features/staff/graphql/`.
 */

// -- Shared filter / sort primitives --

export type FilterOperator =
  | "EQUAL"
  | "NOT_EQUAL"
  | "CONTAINS"
  | "IN"
  | "NOT_IN"
  | "ARRAY_CONTAINS"
  | "GREATER_THAN"
  | "LESS_THAN";

export type FilterCondition = {
  field: string;
  operator: FilterOperator;
  value: unknown;
};

export type FilterInput = {
  conditions: FilterCondition[];
};

/** Convenience alias for optional filter inputs that must permit undefined. */
export type MaybeFilterInput = FilterInput | undefined;

export type SortInput = {
  field: string;
  order: "asc" | "desc";
};

// -- Staff-specific enums --

export type StaffReviewStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type StaffStatusEnum = "ACTIVE" | "INACTIVE" | "REJECTED";

export type StaffDepartment =
  | "ADMINISTRATION"
  | "CUSTOMER_SUPPORT"
  | "FINANCE"
  | "FLEET"
  | "HR"
  | "IT"
  | "LEGAL"
  | "MARKETING"
  | "OPERATIONS"
  | "OTHER"
  | "SALES";

// -- Raw node returned by the (future) `Staff` and `staffWithFilter` queries --

export type StaffRoleRef = {
  id: string;
  name: string;
};

export type StaffProfilePhoto = {
  file_url: string | null;
};

export type StaffCreatedBy = {
  name: string;
};

export type StaffAgency = {
  legal_name: string;
};

/** Row returned inside `staffWithFilter.data[]`. */
export type StaffMemberNode = {
  doc_id: string;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  profile_photo_url: string | null;
  profile_photo?: StaffProfilePhoto | null | undefined;
  department: StaffDepartment | null;
  status: StaffStatusEnum;
  review_status: StaffReviewStatus;
  created_at: string;
  created_by?: StaffCreatedBy | null | undefined;
  last_login_at?: string | null | undefined;
  days_since_account_created: number;
  roles: StaffRoleRef[] | null;
  notes?: string | null | undefined;
  agency: StaffAgency;
};

/** Envelope shape returned by paginated `staffWithFilter`. */
export type StaffPageInfoNode = {
  pagesCount: number;
  previousCursor: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type StaffWithFilterEnvelope = {
  data: StaffMemberNode[];
  count: number;
  pageInfo: StaffPageInfoNode;
};

export type StaffWithFilterQuery = {
  staffWithFilter: StaffWithFilterEnvelope;
};

export type StaffWithFilterQueryVariables = {
  filters?: FilterInput | undefined;
  limit?: number | undefined;
  pageNumber?: number | undefined;
  sort?: SortInput[] | undefined;
};

export type StaffQuery = {
  staff: StaffMemberNode | null;
};

export type StaffQueryVariables = {
  docId: string;
};

// -- Mutation inputs --

export type CreateStaffInput = {
  name: string;
  email: string;
  phone: string;
  country_code: string;
  role_ids: string[];
  status?: StaffStatusEnum | undefined;
  profile_photo_url?: string | null | undefined;
  department?: StaffDepartment | undefined;
};

export type UpdateStaffInput = {
  doc_id: string;
  name?: string | undefined;
  phone?: string | undefined;
  country_code?: string | undefined;
  role_ids?: string[] | undefined;
  status?: StaffStatusEnum | undefined;
  profile_photo_url?: string | undefined;
  department?: StaffDepartment | undefined;
  notes?: string | null | undefined;
};

export type CreateStaffMutationVariables = {
  createStaffInput: CreateStaffInput;
};

export type ReviewStaffApplicationInput = {
  staff_id: string;
  decision: "ACCEPTED" | "REJECTED";
  reason?: string | undefined;
  /** Assigned roles — at least one is required when approving. */
  roleIds?: string[] | undefined;
};
