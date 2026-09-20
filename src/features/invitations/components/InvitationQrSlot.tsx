"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

import {
  invitationQrLabelStyle,
  invitationQrPlaceholderStyle,
  invitationQrSlotStyle,
} from "../utils/invitation-card-styles";

type InvitationQrSlotProps = {
  label: string;
  /** Accent color for the label text. */
  accent?: string;
};

function randomGuestPayload() {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `guest:preview-${id}`;
}

/** Preview QR for invitation cards — random payload; backend replaces on share. */
export function InvitationQrSlot({ label, accent = "#8a6d2f" }: InvitationQrSlotProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const payload = randomGuestPayload();

    void QRCode.toDataURL(payload, {
      width: 192,
      margin: 1,
      color: { dark: accent || "#20211f", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [accent]);

  return (
    <div
      data-qr-slot="guest"
      data-qr-payload-prefix="guest:"
      style={invitationQrSlotStyle({ accent })}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview QR data URL
        <img
          src={src}
          alt=""
          width={96}
          height={96}
          data-invitation-qr-preview="true"
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "0.5rem",
            background: "#fff",
            padding: "4px",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div data-invitation-qr-placeholder="true" style={invitationQrPlaceholderStyle()} />
      )}
      <p style={invitationQrLabelStyle()}>{label}</p>
    </div>
  );
}
