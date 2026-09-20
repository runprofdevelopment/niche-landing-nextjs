import { resolveInvitationImageUrl } from "../../services/upload-invitation-image";
import {
  DEFAULT_NAMES_FONT_SIZE,
  MAX_NAMES_FONT_SIZE,
  MIN_NAMES_FONT_SIZE,
} from "../../utils/invitation-styles";

import type { InvitationLanguage, InvitationLayout, InvitationTemplate } from "../../types";
import type { SaveEventInvitationInput } from "../mutations/event-invitation-save";
import type { EventInvitationFindNode } from "../queries/event-invitation-find";
import type { InvitationTemplateListRowNode } from "../queries/invitation-template-list";
import type { Invitation } from "@/features/events/types";

export function mapInvitationLanguageFromApi(value: string | null | undefined): InvitationLanguage {
  if (value === "Arabic" || value === "ar" || value === "AR") return "Arabic";
  return "English";
}

export function mapInvitationLanguageToApi(value: InvitationLanguage | string | undefined): string {
  if (value === "Arabic" || value === "ar" || value === "AR") return "ar";
  return "en";
}

export function mapInvitationLayoutFromApi(value: string | null | undefined): InvitationLayout {
  return value === "modern" ? "modern" : "classic";
}

function clampNamesFontSize(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_NAMES_FONT_SIZE;
  return Math.min(MAX_NAMES_FONT_SIZE, Math.max(MIN_NAMES_FONT_SIZE, value));
}

export function mapInvitationTemplateListRow(
  row: InvitationTemplateListRowNode,
): InvitationTemplate {
  const templateImageUrl = row.templateImageUrl?.trim();
  const html = row.html ?? undefined;

  return {
    id: row.id,
    name: row.name?.trim() || "Untitled",
    language: mapInvitationLanguageFromApi(row.language),
    layout: mapInvitationLayoutFromApi(row.layout),
    headingFont: row.headingFont?.trim() || "Cormorant Garamond",
    bodyFont: row.bodyFont?.trim() || "Karla",
    namesFontSize: clampNamesFontSize(row.namesFontSize),
    accent: row.accent?.trim() || "#8a6d2f",
    background: row.background?.trim() || "#fbf8f1",
    ...(templateImageUrl ? { templateImageUrl } : {}),
    title: "",
    message: "",
    dateLine: "",
    timeLine: "",
    venueLine: "",
    footer: "",
    brideName: "",
    groomName: "",
    ...(html ? { html } : {}),
    createdAt: row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updatedAt ?? row.createdAt ?? new Date().toISOString(),
  };
}

export function mapEventInvitationFindToInvitation(
  node: EventInvitationFindNode,
  eventId: string,
): Invitation {
  const templateImage = node.templateImageUrl?.trim();

  return {
    eventId,
    language: mapInvitationLanguageFromApi(node.language),
    layout: mapInvitationLayoutFromApi(node.layout),
    headingFont: node.headingFont?.trim() || "Cormorant Garamond",
    bodyFont: node.bodyFont?.trim() || "Karla",
    namesFontSize: clampNamesFontSize(node.namesFontSize),
    accent: node.accent?.trim() || "#8a6d2f",
    background: node.background?.trim() || "#fbf8f1",
    brideName: node.brideName?.trim() || "",
    groomName: node.groomName?.trim() || "",
    title: node.title?.trim() || "",
    message: node.message?.trim() || "",
    dateLine: node.dateLine?.trim() || "",
    timeLine: node.timeLine?.trim() || "",
    venueLine: node.venueLine?.trim() || "",
    footer: node.footer?.trim() || "",
    ...(templateImage ? { templateImage } : {}),
  };
}

export type BuildSaveEventInvitationArgs = {
  eventId: string;
  inv: Invitation;
  html: string;
  saveAsReusable: boolean;
  templateId?: string | null;
  templateName?: string | null;
};

/** Always send full styles + details; templateId optional when a saved template was selected. */
export function buildSaveEventInvitationInput(
  args: BuildSaveEventInvitationArgs,
): SaveEventInvitationInput {
  const { eventId, inv, html, saveAsReusable, templateId, templateName } = args;
  return {
    eventId,
    accent: inv.accent,
    background: inv.background,
    bodyFont: inv.bodyFont,
    brideName: inv.brideName,
    dateLine: inv.dateLine,
    footer: inv.footer,
    groomName: inv.groomName,
    headingFont: inv.headingFont,
    html,
    language: mapInvitationLanguageToApi(inv.language),
    layout: inv.layout === "modern" ? "modern" : "classic",
    message: inv.message,
    namesFontSize: inv.namesFontSize ?? DEFAULT_NAMES_FONT_SIZE,
    saveAsReusable,
    templateId: templateId?.trim() ? templateId.trim() : null,
    templateImageUrl: resolveInvitationImageUrl(inv.templateImage),
    templateName: saveAsReusable && templateName?.trim() ? templateName.trim() : null,
    timeLine: inv.timeLine,
    title: inv.title,
    venueLine: inv.venueLine,
  };
}

export function injectTemplateStylesIntoInvitation(
  inv: Invitation,
  template: Pick<
    InvitationTemplate,
    | "language"
    | "layout"
    | "headingFont"
    | "bodyFont"
    | "namesFontSize"
    | "accent"
    | "background"
    | "templateImageUrl"
  >,
): Invitation {
  const { templateImage: _previousImage, ...rest } = inv;
  return {
    ...rest,
    language: template.language,
    layout: template.layout,
    headingFont: template.headingFont,
    bodyFont: template.bodyFont,
    namesFontSize: template.namesFontSize,
    accent: template.accent,
    background: template.background,
    ...(template.templateImageUrl ? { templateImage: template.templateImageUrl } : {}),
  };
}
