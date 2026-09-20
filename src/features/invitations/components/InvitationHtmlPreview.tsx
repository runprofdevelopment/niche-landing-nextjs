"use client";

import { cn } from "@/lib/utils";

type InvitationHtmlPreviewProps = {
  /** Full HTML document from create/edit API (`html` field). */
  html: string;
  className?: string;
  title?: string;
};

/**
 * Renders a saved invitation exactly as the backend stores it.
 * Used for edit mode: GET invitation → show html in iframe.
 * Create mode keeps using the live React designer instead.
 */
export function InvitationHtmlPreview({
  html,
  className,
  title = "Invitation preview",
}: InvitationHtmlPreviewProps) {
  if (!html.trim()) {
    return (
      <div
        className={cn(
          "flex aspect-210/297 w-full items-center justify-center rounded-md border text-sm text-muted-foreground",
          className,
        )}
      >
        No invitation HTML to preview
      </div>
    );
  }

  return (
    <iframe
      title={title}
      srcDoc={html}
      sandbox="allow-same-origin"
      className={cn("aspect-210/297 w-full bg-transparent", className)}
    />
  );
}
