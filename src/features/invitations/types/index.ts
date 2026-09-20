export type InvitationLayout = "classic" | "modern";

export type InvitationLanguage = "English" | "Arabic";

/** Global collection template — not tied to an event. */
export type InvitationTemplate = {
  id: string;
  name: string;
  language: InvitationLanguage;
  layout: InvitationLayout;
  headingFont: string;
  bodyFont: string;
  /** Bride & groom name size in px */
  namesFontSize: number;
  accent: string;
  background: string;
  title: string;
  message: string;
  dateLine: string;
  timeLine: string;
  venueLine: string;
  footer: string;
  brideName: string;
  groomName: string;
  /** Optional uploaded background template public URL */
  templateImageUrl?: string;
  /** Optional saved HTML snapshot for backend */
  html?: string;
  /** Optional stylesheet paired with html */
  css?: string;
  createdAt: string;
  updatedAt: string;
};

/** Event-bound invitation ready for share (QR injected per guest on backend). */
export type EventInvitationRecord = {
  id: string;
  eventId: string;
  templateId: string;
  brideName: string;
  groomName: string;
  footer: string;
  /** Full HTML document for the invitation */
  html: string;
  /** Stylesheet content sent with html for backend rendering */
  css: string;
  status: "ready_to_share" | "shared";
  createdAt: string;
};

/**
 * Share target for invitations.
 * - `"all"` — every guest on the event
 * - guest id string — one selected guest
 */
export type InvitationGuestIds = "all" | string;

export type InvitationDesignFields = Pick<
  InvitationTemplate,
  | "language"
  | "layout"
  | "headingFont"
  | "bodyFont"
  | "namesFontSize"
  | "accent"
  | "background"
  | "title"
  | "message"
  | "dateLine"
  | "timeLine"
  | "venueLine"
  | "footer"
  | "brideName"
  | "groomName"
>;

export function isArabicLanguage(language: InvitationLanguage | string | undefined) {
  return language === "Arabic" || language === "ar";
}
