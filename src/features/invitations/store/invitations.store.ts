"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { uid } from "@/features/events/utils/uid";

import { createBlankTemplate, MOCK_INVITATION_TEMPLATES } from "../data/mock-templates";

import type { EventInvitationRecord, InvitationGuestIds, InvitationTemplate } from "../types";

type SaveEventInvitationInput = {
  eventId: string;
  templateId: string;
  brideName: string;
  groomName: string;
  footer: string;
  /** Full HTML document (includes embedded styles). */
  html: string;
  /** Stylesheet for the invitation (also embedded in html). */
  css: string;
};

type ShareJob = {
  jobId: string;
  status: "processing";
  total: number;
  guestIds: InvitationGuestIds;
};

type InvitationsState = {
  templates: InvitationTemplate[];
  eventInvitations: EventInvitationRecord[];

  createTemplate: (
    input: Omit<InvitationTemplate, "id" | "createdAt" | "updatedAt"> & {
      html?: string;
      css?: string;
    },
  ) => InvitationTemplate;
  updateTemplate: (
    id: string,
    patch: Partial<InvitationTemplate>,
  ) => InvitationTemplate | undefined;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => InvitationTemplate | undefined;

  saveEventInvitation: (input: SaveEventInvitationInput) => EventInvitationRecord;

  shareEventInvitation: (
    eventId: string,
    invitationId: string | undefined,
    guestIds: InvitationGuestIds,
    guestTotal: number,
  ) => ShareJob;

  /**
   * Share Invitation — single BE call shape:
   * save invitation (html + css) for the event, then share to guests.
   * `guestIds` is `"all"` or one selected guest id.
   */
  saveAndShareEventInvitation: (
    input: SaveEventInvitationInput & {
      guestIds: InvitationGuestIds;
      guestTotal?: number;
    },
  ) => { invitation: EventInvitationRecord; share: ShareJob | null };
};

function resolveShareTotal(guestIds: InvitationGuestIds, guestTotal: number) {
  if (guestIds === "all") return guestTotal;
  return guestIds ? 1 : 0;
}

function payloadMeta(html: string, css: string) {
  return {
    htmlLength: html.length,
    cssLength: css.length,
    hasQrSlot: html.includes('data-qr-slot="guest"'),
    html,
    css,
  };
}

export const useInvitationsStore = create<InvitationsState>()(
  persist(
    (set, get) => ({
      templates: MOCK_INVITATION_TEMPLATES,
      eventInvitations: [],

      createTemplate: (input) => {
        const now = new Date().toISOString();
        const template: InvitationTemplate = {
          ...createBlankTemplate(),
          ...input,
          id: uid("tpl"),
          createdAt: now,
          updatedAt: now,
        };

        const html = template.html ?? "";
        const css = template.css ?? "";
        console.warn("[invitation-template:save:request]", {
          name: template.name,
          language: template.language,
          layout: template.layout,
          design: {
            accent: template.accent,
            headingFont: template.headingFont,
            bodyFont: template.bodyFont,
            background: template.background,
            namesFontSize: template.namesFontSize,
          },
          ...payloadMeta(html, css),
        });
        console.warn("[invitation-template:save:response]", {
          id: template.id,
          name: template.name,
          language: template.language,
          layout: template.layout,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        });

        set((state) => ({ templates: [template, ...state.templates] }));
        return template;
      },

      updateTemplate: (id, patch) => {
        const existing = get().templates.find((entry) => entry.id === id);
        if (!existing) return undefined;
        const updated: InvitationTemplate = {
          ...existing,
          ...patch,
          id,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: state.templates.map((entry) => (entry.id === id ? updated : entry)),
        }));
        return updated;
      },

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((entry) => entry.id !== id),
          eventInvitations: state.eventInvitations.filter((entry) => entry.templateId !== id),
        })),

      getTemplate: (id) => get().templates.find((entry) => entry.id === id),

      saveEventInvitation: (input) => {
        const now = new Date().toISOString();
        const record: EventInvitationRecord = {
          id: uid("inv"),
          eventId: input.eventId,
          templateId: input.templateId,
          brideName: input.brideName,
          groomName: input.groomName,
          footer: input.footer,
          html: input.html,
          css: input.css,
          status: "ready_to_share",
          createdAt: now,
        };

        console.warn("[event-invitation:save:request]", {
          eventId: input.eventId,
          templateId: input.templateId,
          brideName: input.brideName,
          groomName: input.groomName,
          footer: input.footer,
          ...payloadMeta(input.html, input.css),
        });
        console.warn("[event-invitation:save:response]", {
          id: record.id,
          eventId: record.eventId,
          templateId: record.templateId,
          status: record.status,
          htmlUrl: null,
          createdAt: record.createdAt,
        });

        set((state) => ({
          eventInvitations: [
            record,
            ...state.eventInvitations.filter(
              (entry) =>
                !(entry.eventId === input.eventId && entry.templateId === input.templateId),
            ),
          ],
        }));
        return record;
      },

      shareEventInvitation: (eventId, invitationId, guestIds, guestTotal = 0) => {
        const invitation =
          (invitationId
            ? get().eventInvitations.find((entry) => entry.id === invitationId)
            : undefined) ?? get().eventInvitations.find((entry) => entry.eventId === eventId);

        const total = resolveShareTotal(guestIds, guestTotal);
        const job: ShareJob = {
          jobId: uid("share"),
          status: "processing",
          total,
          guestIds,
        };

        console.warn("[event-invitation:share:request]", {
          eventId,
          invitationId: invitation?.id ?? null,
          guestIds,
          total,
          htmlLength: invitation?.html.length ?? 0,
          cssLength: invitation?.css.length ?? 0,
          hasQrSlot: Boolean(invitation?.html.includes('data-qr-slot="guest"')),
        });
        console.warn("[event-invitation:share:response]", job);

        if (invitation) {
          set((state) => ({
            eventInvitations: state.eventInvitations.map((entry) =>
              entry.id === invitation.id ? { ...entry, status: "shared" } : entry,
            ),
          }));
        }

        return job;
      },

      saveAndShareEventInvitation: (input) => {
        const { guestTotal = 0, guestIds, ...saveInput } = input;
        const total = resolveShareTotal(guestIds, guestTotal);

        // One request shape the backend will accept: save for event + share to clients
        console.warn("[event-invitation:share:request]", {
          action: "save_and_share",
          eventId: saveInput.eventId,
          templateId: saveInput.templateId,
          brideName: saveInput.brideName,
          groomName: saveInput.groomName,
          footer: saveInput.footer,
          guestIds,
          guestTotal: total,
          ...payloadMeta(saveInput.html, saveInput.css),
        });

        const invitation = get().saveEventInvitation(saveInput);

        if (total <= 0) {
          console.warn("[event-invitation:share:response]", {
            invitationId: invitation.id,
            shared: false,
            reason: "no_guests",
            saved: true,
            guestIds,
          });
          return { invitation, share: null };
        }

        const share = get().shareEventInvitation(
          saveInput.eventId,
          invitation.id,
          guestIds,
          guestTotal,
        );
        console.warn("[event-invitation:share:response]", {
          invitationId: invitation.id,
          shared: true,
          saved: true,
          jobId: share.jobId,
          total: share.total,
          guestIds: share.guestIds,
        });
        return { invitation, share };
      },
    }),
    {
      name: "invitation-templates-store",
      version: 4,
      migrate: (persisted) => {
        const state = persisted as
          | {
              templates?: Array<{ layout?: string; namesFontSize?: number; css?: string }>;
              eventInvitations?: Array<{ css?: string; html?: string }>;
            }
          | undefined;
        if (!state) return state as never;
        return {
          ...state,
          templates: (state.templates ?? []).map((template) => ({
            ...template,
            layout: template.layout === "modern" ? "modern" : "classic",
            namesFontSize: typeof template.namesFontSize === "number" ? template.namesFontSize : 48,
            css: template.css ?? "",
          })),
          eventInvitations: (state.eventInvitations ?? []).map((entry) => ({
            ...entry,
            css: entry.css ?? "",
            html: entry.html ?? "",
          })),
        } as never;
      },
    },
  ),
);
