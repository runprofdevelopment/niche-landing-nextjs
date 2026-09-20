/**
 * Snapshot the invitation preview DOM into HTML for the backend.
 *
 * Live preview uses inline styles only (no Tailwind). Cloning that DOM yields a
 * pixel-matching saved document. Preview QR images are stripped so the backend
 * can inject guest QR codes into `[data-qr-slot="guest"]`.
 */

import {
  invitationQrLabelStyle,
  invitationQrPlaceholderStyle,
  invitationQrSlotStyle,
  cssPropertiesToString,
  TEMPLATE_IMAGE_ATTR,
} from "./invitation-card-styles";

export type SerializedInvitation = {
  /** Full standalone HTML document (includes <style>). */
  html: string;
  /** Stylesheet content (also embedded in `html`). */
  css: string;
  /** Card / body markup only. */
  bodyHtml: string;
  lang: string;
  dir: "ltr" | "rtl";
};

export function serializeInvitationHtml(node: HTMLElement): string {
  return serializeInvitation(node).html;
}

export function serializeInvitation(
  node: HTMLElement,
  options: { templateImageUrl?: string; headingFont?: string; bodyFont?: string } = {},
): SerializedInvitation {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.removeAttribute("data-exporting");

  // Export should fill the saved iframe / guest surface the same way as live.
  clone.style.maxWidth = "100%";
  clone.style.width = "100%";
  clone.style.margin = "0";

  if (options.templateImageUrl) {
    ensureTemplateImage(clone, options.templateImageUrl);
  }

  prepareQrSlotForExport(clone, clone.style.color || undefined);

  const lang = clone.getAttribute("lang") || "en";
  const dir: "ltr" | "rtl" =
    (clone.getAttribute("dir") as "ltr" | "rtl" | null) || (lang === "ar" ? "rtl" : "ltr");
  const headingFont =
    options.headingFont ||
    extractFontFamily(clone.querySelector("[data-inv-field='brideName']")) ||
    "Cormorant Garamond";
  const bodyFont = options.bodyFont || extractFontFamily(clone) || "Karla";
  const css = buildInvitationCss();
  const bodyHtml = clone.outerHTML;
  const html = wrapInvitationDocument({
    lang,
    dir,
    css,
    bodyHtml,
    fonts: [headingFont, bodyFont],
  });

  return { html, css, bodyHtml, lang, dir };
}

/** HTML + CSS when the user uploaded a ready invitation image instead of designing. */
export function serializeReadyInvitationHtml(imageUrl: string, lang = "en"): string {
  return serializeReadyInvitation(imageUrl, lang).html;
}

export function serializeReadyInvitation(imageUrl: string, lang = "en"): SerializedInvitation {
  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";
  const css = buildInvitationCss();
  const bodyHtml = `
  <div class="invitation-card" lang="${lang}" dir="${dir}" style="position:relative;margin:0;width:100%;aspect-ratio:210/297;overflow:hidden;border-radius:0.375rem;border:1px solid #e5e5e5;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
    <img class="ready-invitation" src="${escapeHtmlAttr(imageUrl)}" alt="" style="display:block;width:100%;height:100%;object-fit:cover;" />
    <div data-qr-slot="guest" data-qr-payload-prefix="guest:" style="${cssPropertiesToString(invitationQrSlotStyle({ accent: "#8a6d2f" }))}">
      <div data-invitation-qr-placeholder="true" style="${cssPropertiesToString(invitationQrPlaceholderStyle())}"></div>
      <p style="${cssPropertiesToString(invitationQrLabelStyle())}">Scan to RSVP</p>
    </div>
  </div>`;
  const html = wrapInvitationDocument({ lang, dir, css, bodyHtml, fonts: [] });

  return { html, css, bodyHtml, lang, dir };
}

function ensureTemplateImage(card: HTMLElement, imageUrl: string) {
  const existing = card.querySelector<HTMLImageElement>(`img[${TEMPLATE_IMAGE_ATTR}]`);
  if (existing) {
    existing.setAttribute("src", imageUrl);
    existing.setAttribute(
      "style",
      "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;",
    );
    return;
  }

  const img = card.ownerDocument.createElement("img");
  img.setAttribute(TEMPLATE_IMAGE_ATTR, "true");
  img.setAttribute("src", imageUrl);
  img.setAttribute("alt", "");
  img.setAttribute(
    "style",
    "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;",
  );
  card.insertBefore(img, card.firstChild);
}

/** Strip preview QR images; keep empty placeholder for backend injection. */
function prepareQrSlotForExport(card: HTMLElement, accent?: string) {
  const slot = card.querySelector<HTMLElement>('[data-qr-slot="guest"]');
  if (!slot) return;

  const label =
    slot.querySelector("p")?.textContent?.trim() ||
    slot.querySelector("[data-invitation-qr-label]")?.textContent?.trim() ||
    "Scan to RSVP";

  slot.innerHTML = "";
  slot.setAttribute(
    "style",
    cssPropertiesToString(invitationQrSlotStyle({ accent: accent || "#8a6d2f" })),
  );

  const placeholder = card.ownerDocument.createElement("div");
  placeholder.setAttribute("data-invitation-qr-placeholder", "true");
  placeholder.setAttribute("style", cssPropertiesToString(invitationQrPlaceholderStyle()));
  slot.appendChild(placeholder);

  const labelEl = card.ownerDocument.createElement("p");
  labelEl.setAttribute("style", cssPropertiesToString(invitationQrLabelStyle()));
  labelEl.textContent = label;
  slot.appendChild(labelEl);
}

function extractFontFamily(node: Element | null): string | null {
  if (!node) return null;
  const style = (node as HTMLElement).style?.fontFamily;
  if (!style) return null;
  const match = /'([^']+)'|"([^"]+)"|([^,]+)/.exec(style);
  return (match?.[1] || match?.[2] || match?.[3] || "").trim() || null;
}

function escapeHtmlAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildGoogleFontsHref(fonts: string[]): string | null {
  const unique = [...new Set(fonts.map((font) => font.trim()).filter(Boolean))];
  if (unique.length === 0) return null;
  const families = unique
    .map((font) => `family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;500;600`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function buildInvitationCss(): string {
  return `
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent;
    }
    body {
      display: flex;
      align-items: stretch;
      justify-content: center;
    }
    .invitation-card {
      position: relative;
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      aspect-ratio: 210 / 297;
      margin: 0;
    }
    .invitation-card img[${TEMPLATE_IMAGE_ATTR}] {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }
  `;
}

function wrapInvitationDocument({
  lang,
  dir,
  css,
  bodyHtml,
  fonts,
}: {
  lang: string;
  dir: string;
  css: string;
  bodyHtml: string;
  fonts: string[];
}): string {
  const fontsHref = buildGoogleFontsHref(fonts);
  const fontsLinks = fontsHref
    ? `  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontsHref}" rel="stylesheet" />`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
${fontsLinks}
  <style>
${css}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

export const QR_SLOT_SELECTOR = '[data-qr-slot="guest"]';
export { TEMPLATE_IMAGE_ATTR };
