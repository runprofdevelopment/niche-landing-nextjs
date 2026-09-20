import { DEFAULT_NAMES_FONT_SIZE, withAlpha } from "./invitation-styles";

import type { CSSProperties } from "react";

export type InvitationCardDesign = {
  language?: string;
  layout: "classic" | "modern";
  headingFont: string;
  bodyFont: string;
  namesFontSize?: number;
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
  templateImageUrl?: string;
};

export function invitationCardShellStyle(
  design: Pick<InvitationCardDesign, "accent" | "background" | "bodyFont">,
): CSSProperties {
  return {
    position: "relative",
    margin: "0 auto",
    width: "100%",
    maxWidth: "100%",
    aspectRatio: "210 / 297",
    overflow: "hidden",
    borderRadius: "0.375rem",
    border: "1px solid #e5e5e5",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    backgroundColor: design.background,
    color: withAlpha(design.accent, 0.82),
    fontFamily: `'${design.bodyFont}', sans-serif`,
  };
}

export function invitationCardContentStyle(): CSSProperties {
  return {
    position: "relative",
    zIndex: 1,
    display: "flex",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "3rem 2.5rem",
    textAlign: "center",
  };
}

export function invitationTemplateImageStyle(): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  };
}

export function invitationTitleStyle(
  design: Pick<InvitationCardDesign, "layout" | "accent">,
): CSSProperties {
  const modern = design.layout === "modern";
  return {
    margin: 0,
    color: withAlpha(design.accent, 0.7),
    ...(modern
      ? { fontSize: "11px", letterSpacing: "0.35em", textTransform: "uppercase" as const }
      : { fontSize: "0.875rem" }),
  };
}

export function invitationNameStyle(
  design: Pick<InvitationCardDesign, "layout" | "accent" | "headingFont" | "namesFontSize">,
): CSSProperties {
  const modern = design.layout === "modern";
  const namesSize = design.namesFontSize ?? DEFAULT_NAMES_FONT_SIZE;
  return {
    margin: 0,
    fontFamily: `'${design.headingFont}', serif`,
    color: design.accent,
    fontSize: `${namesSize}px`,
    lineHeight: 1.15,
    fontWeight: modern ? 600 : 400,
    ...(modern ? { letterSpacing: "0.12em", textTransform: "uppercase" as const } : {}),
  };
}

export function invitationAmpersandStyle(
  design: Pick<InvitationCardDesign, "accent" | "headingFont">,
): CSSProperties {
  return {
    margin: 0,
    fontSize: "1.125rem",
    color: design.accent,
    fontFamily: `'${design.headingFont}', serif`,
  };
}

export function invitationMessageStyle(
  design: Pick<InvitationCardDesign, "accent">,
): CSSProperties {
  return {
    margin: 0,
    maxWidth: "80%",
    fontSize: "0.875rem",
    whiteSpace: "pre-line",
    color: withAlpha(design.accent, 0.82),
  };
}

export function invitationDateStyle(design: Pick<InvitationCardDesign, "accent">): CSSProperties {
  return {
    margin: 0,
    fontWeight: 500,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: design.accent,
    fontSize: "0.875rem",
  };
}

export function invitationMetaStyle(design: Pick<InvitationCardDesign, "accent">): CSSProperties {
  return {
    margin: 0,
    fontSize: "0.875rem",
    color: withAlpha(design.accent, 0.82),
  };
}

export function invitationFooterStyle(design: Pick<InvitationCardDesign, "accent">): CSSProperties {
  return {
    margin: "0.5rem 0 0",
    fontSize: "0.75rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: withAlpha(design.accent, 0.7),
  };
}

export function invitationQrSlotStyle(design: Pick<InvitationCardDesign, "accent">): CSSProperties {
  return {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    color: design.accent,
  };
}

export function invitationQrPlaceholderStyle(): CSSProperties {
  return {
    width: "96px",
    height: "96px",
    borderRadius: "0.5rem",
    border: "2px solid currentColor",
    opacity: 0.4,
  };
}

export function invitationQrLabelStyle(): CSSProperties {
  return {
    margin: 0,
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  };
}

export function cssPropertiesToString(style: CSSProperties): string {
  return Object.entries(style)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
      return `${cssKey}:${String(value)}`;
    })
    .join(";");
}

export const TEMPLATE_IMAGE_ATTR = "data-invitation-template-image";
