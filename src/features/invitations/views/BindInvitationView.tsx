"use client";

import { toPng } from "html-to-image";
import { ArrowLeft, Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { INVITATION_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useEventListQuery } from "@/features/events/graphql";
import { defaultInvitation } from "@/features/events/store/events.store";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { TimePicker } from "@/shared/components/ui/time-picker";

import { InvitationPreviewCard } from "../components/InvitationPreviewCard";
import {
  injectTemplateStylesIntoInvitation,
  useEventInvitationSaveMutation,
  useInvitationTemplateListQuery,
} from "../graphql";
import { resolveInvitationImageUrl } from "../services/upload-invitation-image";
import {
  formatInvitationDateLine,
  formatInvitationTimeLine,
  parseInvitationDateLine,
  parseInvitationTimeLine,
} from "../utils/invitation-datetime";
import { DEFAULT_NAMES_FONT_SIZE } from "../utils/invitation-styles";
import { serializeInvitation } from "../utils/serialize-invitation-html";

import type { InvitationTemplate } from "../types";
import type { EventRecord, Invitation } from "@/features/events/types";

type BindInvitationViewProps = {
  templateId: string;
};

export default function BindInvitationView({ templateId }: BindInvitationViewProps) {
  const t = useTranslations("invitations");
  const { rows: templates, loading: templatesLoading } = useInvitationTemplateListQuery({
    pagination: { limit: 100, page: 1 },
  });
  const { events, loading: eventsLoading } = useEventListQuery({
    pagination: { limit: 100, page: 1 },
  });

  const template = useMemo(
    () => templates.find((row) => row.id === templateId),
    [templateId, templates],
  );

  if (templatesLoading || eventsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">{t("templateNotFound")}</p>
        <Button asChild variant="outline">
          <Link href={routes.invitations}>{t("backToInvitations")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <BindInvitationForm
      key={template.id}
      template={template}
      templateId={templateId}
      events={events}
    />
  );
}

/** Template styles + image; wedding copy uses placeholders until an event is selected. */
function buildInitialInvitation(template: InvitationTemplate): Invitation {
  return injectTemplateStylesIntoInvitation(defaultInvitation("pending"), template);
}

function applyEventToInvitation(inv: Invitation, event: EventRecord): Invitation {
  const nextDate = event.date ? parseInvitationDateLine(event.date) : null;
  const nextTime = event.startTime ? parseInvitationTimeLine(event.startTime) : null;

  return {
    ...inv,
    eventId: event.id,
    brideName: event.brideName || inv.brideName,
    groomName: event.groomName || inv.groomName,
    dateLine: nextDate
      ? formatInvitationDateLine(nextDate, inv.language)
      : event.date || inv.dateLine,
    timeLine: nextTime ? formatInvitationTimeLine(nextTime) : event.startTime || inv.timeLine,
    venueLine: event.venueName || event.address || inv.venueLine,
  };
}

function resetEventFieldsToPlaceholders(inv: Invitation): Invitation {
  const placeholders = defaultInvitation("pending");
  return {
    ...inv,
    eventId: "",
    brideName: placeholders.brideName,
    groomName: placeholders.groomName,
    title: placeholders.title,
    message: placeholders.message,
    dateLine: placeholders.dateLine,
    timeLine: placeholders.timeLine,
    venueLine: placeholders.venueLine,
    footer: placeholders.footer,
  };
}

function BindInvitationForm({
  template,
  templateId,
  events,
}: {
  template: InvitationTemplate;
  templateId: string;
  events: EventRecord[];
}) {
  const t = useTranslations("invitations");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const canUpdateInvitation = can(INVITATION_PERMISSIONS.update);
  const canCreateInvitation = can(INVITATION_PERMISSIONS.create);
  const canSave = canUpdateInvitation || canCreateInvitation;
  const canEditDetails = canSave;
  const router = useRouter();
  const { saveEventInvitation, saving } = useEventInvitationSaveMutation();

  const [eventId, setEventId] = useState("");
  const [exporting, setExporting] = useState(false);
  const [inv, setInv] = useState<Invitation>(() => buildInitialInvitation(template));
  const cardRef = useRef<HTMLDivElement | null>(null);

  const design = useMemo(
    () => ({
      language: inv.language === "Arabic" ? ("Arabic" as const) : ("English" as const),
      layout: inv.layout === "modern" ? ("modern" as const) : ("classic" as const),
      headingFont: inv.headingFont,
      bodyFont: inv.bodyFont,
      namesFontSize: inv.namesFontSize ?? DEFAULT_NAMES_FONT_SIZE,
      accent: inv.accent,
      background: inv.background,
      title: inv.title,
      message: inv.message,
      dateLine: inv.dateLine,
      timeLine: inv.timeLine,
      venueLine: inv.venueLine,
      footer: inv.footer,
      brideName: inv.brideName,
      groomName: inv.groomName,
    }),
    [inv],
  );

  const set = <K extends keyof Invitation>(key: K, value: Invitation[K]) =>
    setInv((prev) => ({ ...prev, [key]: value }));

  function handleEventChange(nextEventId: string | null) {
    const id = nextEventId ?? "";
    setEventId(id);
    const selected = events.find((event) => event.id === id);
    if (!selected) {
      setInv((prev) => resetEventFieldsToPlaceholders(prev));
      return;
    }
    setInv((prev) => applyEventToInvitation(prev, selected));
  }

  async function exportPng() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      if (typeof document !== "undefined" && "fonts" in document) {
        await document.fonts.ready;
      }
      const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitation-${inv.brideName}-${inv.groomName}.png`.replace(/\s+/g, "-");
      a.click();
      toast.success(t("pngExported"));
    } catch {
      toast.error(t("exportFailed"));
    } finally {
      setExporting(false);
    }
  }

  async function handleSave() {
    if (!canSave) return;
    if (!eventId) {
      toast.error(t("selectEventRequired"));
      return;
    }
    if (!cardRef.current) {
      toast.error(t("saveFailed"));
      return;
    }

    const durableImageUrl = resolveInvitationImageUrl(inv.templateImage);
    const html = serializeInvitation(cardRef.current, {
      ...(durableImageUrl ? { templateImageUrl: durableImageUrl } : {}),
      headingFont: inv.headingFont,
      bodyFont: inv.bodyFont,
    }).html;

    const { templateImage: _previousImage, ...invWithoutImage } = inv;

    try {
      await saveEventInvitation({
        eventId,
        inv: {
          ...invWithoutImage,
          eventId,
          ...(durableImageUrl ? { templateImage: durableImageUrl } : {}),
        },
        html,
        saveAsReusable: false,
        templateId,
        templateName: null,
      });
      toast.success(t("invitationSaved"));
      router.push(routes.invitations);
    } catch (error) {
      handleError(error, {
        context: { feature: "invitations", action: "EventInvitationSave", extra: { templateId } },
        channels: ["toast"],
      });
    }
  }

  return (
    <PermissionGate permission={INVITATION_PERMISSIONS.view}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href={routes.invitations}>
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold">{t("invitationStudio")}</h1>
                <p className="text-xs text-muted-foreground">{template.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={exporting} onClick={() => void exportPng()}>
                <Download className="me-1 size-4" />
                {t("downloadPng")}
              </Button>
              {canSave ? (
                <Button disabled={saving} onClick={() => void handleSave()}>
                  {saving ? <Spinner size="sm" className="me-1" /> : null}
                  {t("saveTemplate")}
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="grid gap-6 px-4 py-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div
            className={cn(
              "space-y-5 border-b bg-background/90 backdrop-blur md:border-b lg:border-r lg:border-b-0",
              !canEditDetails && "pointer-events-none opacity-50",
            )}
          >
            <section className="space-y-3 p-4">
              <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                {t("weddingDetails")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("stylesLockedHint")}</p>
              <div className="space-y-2">
                <Label>{t("selectEvent")}</Label>
                <Select
                  searchable
                  value={eventId || null}
                  placeholder={t("selectEventPlaceholder")}
                  onValueChange={handleEventChange}
                  items={events.map((event) => ({ value: event.id, label: event.name }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("brideName")}</Label>
                <Input value={inv.brideName} onChange={(e) => set("brideName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("groomName")}</Label>
                <Input value={inv.groomName} onChange={(e) => set("groomName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("openingLine")}</Label>
                <Input value={inv.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("message")}</Label>
                <Textarea value={inv.message} onChange={(e) => set("message", e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("dateLine")}</Label>
                  <DatePicker
                    value={parseInvitationDateLine(inv.dateLine)}
                    onValueChange={(date) =>
                      set("dateLine", date ? formatInvitationDateLine(date, inv.language) : "")
                    }
                    placeholder={t("dateLine")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("timeLine")}</Label>
                  <TimePicker
                    hourCycle="24"
                    value={parseInvitationTimeLine(inv.timeLine)}
                    onValueChange={(date) => set("timeLine", formatInvitationTimeLine(date))}
                    placeholder={t("timeLine")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("venueLine")}</Label>
                <Input value={inv.venueLine} onChange={(e) => set("venueLine", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("footer")}</Label>
                <Input value={inv.footer} onChange={(e) => set("footer", e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">{t("bindInvitationHint")}</p>
            </section>
          </div>

          <div className="flex min-h-0 flex-col items-center justify-start">
            <div className="w-full max-w-130">
              <p className="mb-2 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {t("livePreview")}
              </p>
              <InvitationPreviewCard
                design={{
                  ...design,
                  ...(inv.templateImage ? { templateImageUrl: inv.templateImage } : {}),
                }}
                cardRef={cardRef}
                qrLabel={t("scanToRsvp")}
              />
            </div>
          </div>
        </main>
      </div>
    </PermissionGate>
  );
}
