/**
 * RBAC permission keys — pattern `<resource>.<action>`.
 * Backend must return the same strings on the user profile.
 * Every sidebar view and every mutation should be gated by a key from this catalog.
 */

export const DASHBOARD_PERMISSIONS = {
  view: "dashboard.view",
} as const;

export const EVENT_PERMISSIONS = {
  view: "event.view",
  create: "event.create",
  update: "event.update",
  delete: "event.delete",
  /** Abaya label set — listed under Event in the role permission picker. */
  abayaView: "event.abaya.view",
  abayaGenerate: "event.abaya.generate",
  /** Event staff assignments. */
  staffView: "event.staff.view",
  staffCreate: "event.staff.create",
  staffDelete: "event.staff.delete",
  /** Event timeline entries. */
  timelineView: "event.timeline.view",
  timelineCreate: "event.timeline.create",
  timelineUpdate: "event.timeline.update",
  timelineDelete: "event.timeline.delete",
  /** Event tables list / guest assignments. */
  tablesView: "event.tables.view",
  /** Event guest check-in. */
  checkInView: "event.checkin.view",
  checkIn: "event.checkin",
} as const;

export const HALL_PERMISSIONS = {
  view: "hall.view",
  create: "hall.create",
  update: "hall.update",
  delete: "hall.delete",
} as const;

export const GUEST_PERMISSIONS = {
  view: "guest.view",
  create: "guest.create",
  update: "guest.update",
  delete: "guest.delete",
} as const;

export const SEATING_PERMISSIONS = {
  view: "seating.view",
  update: "seating.update",
} as const;

export const INVITATION_PERMISSIONS = {
  view: "invitation.view",
  create: "invitation.create",
  update: "invitation.update",
  delete: "invitation.delete",
  share: "invitation.share",
} as const;

export const CHECK_IN_PERMISSIONS = {
  view: EVENT_PERMISSIONS.checkInView,
  update: EVENT_PERMISSIONS.checkIn,
} as const;

export const SECURITY_PERMISSIONS = {
  view: "security.view",
  membersCreate: "security.members.create",
  membersUpdate: "security.members.update",
  membersDelete: "security.members.delete",
  membersApprove: "security.members.approve",
  membersReject: "security.members.reject",
} as const;

export const REPORT_PERMISSIONS = {
  view: "report.view",
  overviewView: "report.overview.view",
  analyticsView: "report.analytics.view",
} as const;

export const SETTINGS_PERMISSIONS = {
  view: "settings.view",
  update: "settings.update",
} as const;

export const REQUEST_PERMISSIONS = {
  view: "request.view",
  update: "request.update",
} as const;

export const STAFF_PERMISSIONS = {
  view: "staff.view",
  create: "staff.create",
  update: "staff.update",
  delete: "staff.delete",
  /** Role management — shown under Staff in the permission picker. */
  rolesView: "role.view",
  rolesCreate: "role.create",
  rolesUpdate: "role.update",
  rolesDelete: "role.delete",
} as const;

/** Aliases for gating — same keys as `STAFF_PERMISSIONS.roles*`. */
export const ROLE_PERMISSIONS = {
  view: STAFF_PERMISSIONS.rolesView,
  create: STAFF_PERMISSIONS.rolesCreate,
  update: STAFF_PERMISSIONS.rolesUpdate,
  delete: STAFF_PERMISSIONS.rolesDelete,
} as const;

/** Registered guest/owner accounts (Register Users) — own module in the permission picker. */
export const REGISTRATION_USERS_PERMISSIONS = {
  view: "registrationUsers.view",
  update: "registrationUsers.update",
} as const;

/** Grouped catalog — each feature owns its `.view` + CRUD (and extra actions). */
export const PERMISSIONS = {
  dashboard: DASHBOARD_PERMISSIONS,
  event: EVENT_PERMISSIONS,
  hall: HALL_PERMISSIONS,
  guest: GUEST_PERMISSIONS,
  seating: SEATING_PERMISSIONS,
  invitation: INVITATION_PERMISSIONS,
  security: SECURITY_PERMISSIONS,
  report: REPORT_PERMISSIONS,
  settings: SETTINGS_PERMISSIONS,
  request: REQUEST_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
  registrationUsers: REGISTRATION_USERS_PERMISSIONS,
} as const;

type PermissionGroups = typeof PERMISSIONS;
type PermissionGroupKey = keyof PermissionGroups;

/** Flat union of every permission string in the catalog. */
export type PermissionKey = {
  [Group in PermissionGroupKey]: PermissionGroups[Group][keyof PermissionGroups[Group]];
}[PermissionGroupKey];

export const ALL_PERMISSION_KEYS = Object.values(PERMISSIONS).flatMap((group) =>
  Object.values(group),
) as PermissionKey[];

/** @deprecated Prefer PERMISSIONS / feature groups */
export const permissions = {
  events: {
    read: EVENT_PERMISSIONS.view,
    write: EVENT_PERMISSIONS.update,
    delete: EVENT_PERMISSIONS.delete,
  },
} as const;
