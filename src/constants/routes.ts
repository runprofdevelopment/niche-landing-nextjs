export const authRoutes = {
  login: "/",
  register: "/register",
  forgotPassword: "/forgot-password",
  checkEmail: "/check-email",
  verifyEmail: "/verify-email",
  resetPassword: "/reset-password",
  pendingApproval: "/pending-approval",
} as const;

export const routes = {
  home: "/",
  dashboard: "/dashboard",
  ...authRoutes,
  events: "/events",
  eventsLive: "/events/live",
  eventsUpcoming: "/events/upcoming",
  eventsCompleted: "/events/completed",
  security: "/security",
  reports: "/reports",
  reportsOverview: "/reports/overview",
  reportsAnalytics: "/reports/analytics",
  settings: "/settings",
  users: "/users",
  usersAll: "/users/all",
  usersAllMember: (id: string) => `/users/all/${id}`,
  usersRoles: "/users/roles",
  usersRoleCreate: "/users/roles/create",
  usersRole: (id: string) => `/users/roles/${id}`,
  usersRoleEdit: (id: string) => `/users/roles/${id}/edit`,
  usersStaff: "/users/staff",
  usersStaffCreate: "/users/staff/create",
  usersStaffMember: (id: string) => `/users/staff/${id}`,
  usersStaffEdit: (id: string) => `/users/staff/${id}/edit`,
  requests: "/requests",
  requestsDetail: (id: string) => `/requests/${id}`,
  invitations: "/invitations",
  invitationsTemplates: "/invitations/templates",
  invitationsSent: "/invitations/sent",
  invitationTemplateCreate: "/invitations/templates/new",
  invitationTemplateEdit: (id: string) => `/invitations/templates/${id}`,
  /** Edit from collection → bind template to an event (bride/groom/footer + event). */
  invitationTemplateUse: (id: string) => `/invitations/templates/${id}/use`,
  event: (id: string) => `/events/${id}`,
  /** @deprecated use eventHallSetup(eventId, hallId) */
  eventHallSetup: (eventId: string, hallId?: string) =>
    hallId ? `/events/${eventId}/halls/${hallId}/setup` : `/events/${eventId}/hall-setup`,
  /** @deprecated use eventDesigner(eventId, hallId) */
  eventDesigner: (eventId: string, hallId?: string) =>
    hallId ? `/events/${eventId}/halls/${hallId}/designer` : `/events/${eventId}/designer`,
  /** @deprecated use eventSeating(eventId, hallId) */
  eventSeating: (eventId: string, hallId?: string) =>
    hallId ? `/events/${eventId}/halls/${hallId}/seating` : `/events/${eventId}/seating`,
  eventHallSetupById: (eventId: string, hallId: string) =>
    `/events/${eventId}/halls/${hallId}/setup`,
  eventHallCreate: (eventId: string) => `/events/${eventId}/halls/new`,
  eventDesignerById: (eventId: string, hallId: string) =>
    `/events/${eventId}/halls/${hallId}/designer`,
  eventSeatingById: (eventId: string, hallId: string) =>
    `/events/${eventId}/halls/${hallId}/seating`,
  eventGuests: (id: string) => `/events/${id}/guests`,
  eventTables: (id: string) => `/events/${id}/tables`,
  eventStaff: (id: string) => `/events/${id}/staff`,
  eventAbayaLabels: (id: string) => `/events/${id}/abaya-labels`,
  eventTimeline: (id: string) => `/events/${id}/timeline`,
  eventCheckIn: (id: string) => `/events/${id}/check-in`,
  eventCheckInScanner: (id: string) => `/events/${id}/check-in/scanner`,
  eventInvitation: (id: string) => `/events/${id}/invitation`,
} as const;

export const publicRoutes = Object.values(authRoutes);
