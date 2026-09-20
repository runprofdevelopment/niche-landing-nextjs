"use client";

import { isArabicLanguage, type InvitationDesignFields } from "../types";
import {
  invitationAmpersandStyle,
  invitationCardContentStyle,
  invitationCardShellStyle,
  invitationDateStyle,
  invitationFooterStyle,
  invitationMessageStyle,
  invitationMetaStyle,
  invitationNameStyle,
  invitationTemplateImageStyle,
  invitationTitleStyle,
  TEMPLATE_IMAGE_ATTR,
} from "../utils/invitation-card-styles";

import { InvitationQrSlot } from "./InvitationQrSlot";

type InvitationPreviewCardProps = {
  design: InvitationDesignFields & { templateImageUrl?: string };
  cardRef?: React.RefObject<HTMLDivElement | null>;
  showQrSlot?: boolean;
  qrLabel?: string;
};

export function InvitationPreviewCard({
  design,
  cardRef,
  showQrSlot = true,
  qrLabel = "SCAN TO RSVP",
}: InvitationPreviewCardProps) {
  const arabic = isArabicLanguage(design.language);

  return (
    <div
      ref={cardRef}
      className="invitation-card"
      lang={arabic ? "ar" : "en"}
      dir={arabic ? "rtl" : "ltr"}
      style={invitationCardShellStyle(design)}
    >
      {design.templateImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded template preview
        <img
          {...{ [TEMPLATE_IMAGE_ATTR]: "true" }}
          src={design.templateImageUrl}
          alt=""
          style={invitationTemplateImageStyle()}
        />
      ) : null}
      <InvitationCardBody design={design} showQrSlot={showQrSlot} qrLabel={qrLabel} />
    </div>
  );
}

export function InvitationCardBody({
  design,
  showQrSlot = true,
  qrLabel = "SCAN TO RSVP",
}: {
  design: InvitationDesignFields;
  showQrSlot?: boolean;
  qrLabel?: string;
}) {
  const arabic = isArabicLanguage(design.language);

  return (
    <div style={invitationCardContentStyle()}>
      <p data-inv-field="title" style={invitationTitleStyle(design)}>
        {design.title}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <h2 data-inv-field="brideName" style={invitationNameStyle(design)}>
          {design.brideName}
        </h2>
        <p style={invitationAmpersandStyle(design)}>{arabic ? "و" : "&"}</p>
        <h2 data-inv-field="groomName" style={invitationNameStyle(design)}>
          {design.groomName}
        </h2>
      </div>

      <div style={{ height: "1px", width: "6rem", backgroundColor: design.accent }} />

      <p data-inv-field="message" style={invitationMessageStyle(design)}>
        {design.message}
      </p>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem" }}
      >
        {design.dateLine ? (
          <p data-inv-field="dateLine" style={invitationDateStyle(design)}>
            {design.dateLine}
          </p>
        ) : null}
        {design.timeLine ? (
          <p data-inv-field="timeLine" style={invitationMetaStyle(design)}>
            {design.timeLine}
          </p>
        ) : null}
        {design.venueLine ? (
          <p data-inv-field="venueLine" style={invitationMetaStyle(design)}>
            {design.venueLine}
          </p>
        ) : null}
      </div>

      {design.footer ? (
        <p data-inv-field="footer" style={invitationFooterStyle(design)}>
          {design.footer}
        </p>
      ) : null}

      {showQrSlot ? <InvitationQrSlot label={qrLabel} accent={design.accent} /> : null}
    </div>
  );
}
