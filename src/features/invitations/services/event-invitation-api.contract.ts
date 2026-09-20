/**
 * Event invitation create / update / find API contract.
 *
 * Recommended approach (Option A): one invitation per event, always send `html` + `css`.
 * - Create → POST
 * - Edit   → PUT with invitation id
 * - Load   → GET so the studio can re-render the saved invitation
 *
 * The dashboard preview:
 * - Create: live React designer → serialize to html/css → POST
 * - Edit: GET returns html/css → render in iframe srcDoc (same look as guests/backend)
 */

export type EventInvitationUpsertInput = {
  eventId: string;
  /** Omit on create; required on update. */
  invitationId?: string;
  brideName: string;
  groomName: string;
  footer: string;
  language: "en" | "ar";
  /** Full HTML document (includes <style> and body). */
  html: string;
  /** Stylesheet used with that HTML (also embedded inside html). */
  css: string;
  /** Optional design metadata for analytics / reopening the editor. */
  meta?: {
    layout?: "classic" | "modern";
    headingFont?: string;
    bodyFont?: string;
    namesFontSize?: number;
    accent?: string;
    background?: string;
    title?: string;
    message?: string;
    dateLine?: string;
    timeLine?: string;
    venueLine?: string;
    /** Remote publicUrl of background / ready image if any. */
    templateImageUrl?: string;
    readyImageUrl?: string;
  };
};

export type EventInvitationApiRecord = {
  id: string;
  eventId: string;
  brideName: string;
  groomName: string;
  footer: string;
  language: "en" | "ar";
  html: string;
  css: string;
  status: "draft" | "ready_to_share" | "shared";
  meta?: EventInvitationUpsertInput["meta"];
  createdAt: string;
  updatedAt: string;
};

export type EventInvitationShareInput = {
  eventId: string;
  invitationId: string;
  /** `"all"` or one guest id */
  guestIds: "all" | string;
};

/**
 * Complete examples for backend testing
 * ------------------------------------
 *
 * Base URL (staging):
 *   https://niche-api-staging-541600106231.europe-west3.run.app
 *
 * Auth:
 *   Authorization: Bearer <firebase-id-token>
 *
 * 1) Upload image (already live)
 * POST /upload
 * multipart/form-data:
 *   file: <binary>
 *   destination: images/events/invitations
 *   urlType: display
 *
 * Response:
 * {
 *   "files": [
 *     {
 *       "id": "b69badaf-f792-445a-8847-eadfec45a616",
 *       "name": "8dbc3cd3d9d143357d037409b53c1732.jpg",
 *       "privateUrl": "images/events/invitations/….jpg",
 *       "publicUrl": "https://firebasestorage.googleapis.com/…&response-content-disposition=inline",
 *       "sizeInBytes": 8915,
 *       "urlType": "display"
 *     }
 *   ]
 * }
 * Use files[0].publicUrl inside html <img src="…">.
 *
 * 2) Create invitation (html + css)
 * POST /events/{eventId}/invitations
 * Content-Type: application/json
 *
 * Request body example:
 * {
 *   "brideName": "Sara",
 *   "groomName": "Omar",
 *   "footer": "Dinner & dancing to follow",
 *   "language": "en",
 *   "html": "<!DOCTYPE html><html lang=\"en\" dir=\"ltr\"><head><meta charset=\"utf-8\" /><style>\n.invitation-card{position:relative;overflow:hidden;width:100%;max-width:520px;aspect-ratio:210/297;margin:0 auto;background:#fbf8f1;}\n.invitation-card img[data-invitation-template-image]{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}\n</style></head><body>\n<div class=\"invitation-card\" lang=\"en\" dir=\"ltr\" style=\"background-color:#fbf8f1;color:#8a6d2fd1;font-family:'Karla',sans-serif;\">\n  <img data-invitation-template-image=\"true\" src=\"https://firebasestorage.googleapis.com/v0/b/niche-staging-94469.firebasestorage.app/o/images%2Fevents%2Finvitations%2Fb69badaf-f792-445a-8847-eadfec45a616-8dbc3cd3d9d143357d037409b53c1732.jpg?alt=media&token=cb5b04a3-0abb-432b-bab9-a7d5056f0750&response-content-disposition=inline\" alt=\"\" style=\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;\" />\n  <div style=\"position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:48px 40px;text-align:center;gap:16px;\">\n    <p>Together with their families</p>\n    <h2 style=\"color:#8a6d2f;font-family:'Cormorant Garamond',serif;font-size:48px;\">Sara</h2>\n    <p>&amp;</p>\n    <h2 style=\"color:#8a6d2f;font-family:'Cormorant Garamond',serif;font-size:48px;\">Omar</h2>\n    <div data-qr-slot=\"guest\" data-qr-payload-prefix=\"guest:\"></div>\n  </div>\n</div>\n</body></html>",
 *   "css": ".invitation-card{position:relative;overflow:hidden;width:100%;max-width:520px;aspect-ratio:210/297;margin:0 auto;}\n.invitation-card img[data-invitation-template-image]{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}",
 *   "meta": {
 *     "layout": "classic",
 *     "headingFont": "Cormorant Garamond",
 *     "bodyFont": "Karla",
 *     "namesFontSize": 48,
 *     "accent": "#8a6d2f",
 *     "background": "#fbf8f1",
 *     "templateImageUrl": "https://firebasestorage.googleapis.com/v0/b/niche-staging-94469.firebasestorage.app/o/images%2Fevents%2Finvitations%2Fb69badaf-f792-445a-8847-eadfec45a616-8dbc3cd3d9d143357d037409b53c1732.jpg?alt=media&token=cb5b04a3-0abb-432b-bab9-a7d5056f0750&response-content-disposition=inline"
 *   }
 * }
 *
 * Response example:
 * {
 *   "id": "inv_01HXYZ…",
 *   "eventId": "evt_01H…",
 *   "brideName": "Sara",
 *   "groomName": "Omar",
 *   "footer": "Dinner & dancing to follow",
 *   "language": "en",
 *   "html": "<!DOCTYPE html>…same as request…",
 *   "css": ".invitation-card{…}",
 *   "status": "ready_to_share",
 *   "meta": { "layout": "classic", "templateImageUrl": "https://…" },
 *   "createdAt": "2026-09-16T14:00:00.000Z",
 *   "updatedAt": "2026-09-16T14:00:00.000Z"
 * }
 *
 * 3) Update invitation (edit)
 * PUT /events/{eventId}/invitations/{invitationId}
 * Body: same shape as create (html + css required again — full replace).
 * Response: same EventInvitationApiRecord with updatedAt bumped.
 *
 * 4) Load invitation for edit preview
 * GET /events/{eventId}/invitations/current
 *   or GET /events/{eventId}/invitations/{invitationId}
 *
 * Response: EventInvitationApiRecord
 * Frontend renders with <iframe srcDoc={html} /> (html already contains css).
 *
 * 5) Share (optional separate call)
 * POST /events/{eventId}/invitations/{invitationId}/share
 * { "guestIds": "all" }  // or { "guestIds": "guest_123" }
 *
 * Response:
 * { "jobId": "share_…", "status": "processing", "total": 120 }
 *
 * Option B (alternative): GraphQL
 *   mutation EventInvitationCreate($data: EventInvitationCreateInput!)
 *   mutation EventInvitationUpdate($id: ID!, $data: EventInvitationUpdateInput!)
 *   query EventInvitationFind($eventId: ID!)
 * Same fields: html, css, brideName, groomName, footer, language, meta.
 *
 * Recommendation: Option A (REST) matching /upload, with html always self-contained
 * (publicUrl images inside <img src>) so backend and FE iframe render identically.
 */

export const EVENT_INVITATION_API_EXAMPLES = {
  createPath: "/events/{eventId}/invitations",
  updatePath: "/events/{eventId}/invitations/{invitationId}",
  findPath: "/events/{eventId}/invitations/current",
  sharePath: "/events/{eventId}/invitations/{invitationId}/share",
} as const;
