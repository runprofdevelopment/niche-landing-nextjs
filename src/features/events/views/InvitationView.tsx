"use client";

import { toPng } from "html-to-image";
import { Download, FileImage, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { INVITATION_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useEventQuery } from "@/features/events/graphql";
import { InvitationPreviewCard } from "@/features/invitations/components/InvitationPreviewCard";
import {
  SaveTemplateDialog,
  type SaveTemplateDialogResult,
} from "@/features/invitations/components/SaveTemplateDialog";
import {
  injectTemplateStylesIntoInvitation,
  useEventInvitationFindQuery,
  useEventInvitationSaveMutation,
  useInvitationTemplateListQuery,
} from "@/features/invitations/graphql";
import {
  uploadInvitationImage,
  resolveInvitationImageUrl,
} from "@/features/invitations/services/upload-invitation-image";
import {
  formatInvitationDateLine,
  formatInvitationTimeLine,
  parseInvitationDateLine,
  parseInvitationTimeLine,
} from "@/features/invitations/utils/invitation-datetime";
import {
  DEFAULT_NAMES_FONT_SIZE,
  MAX_NAMES_FONT_SIZE,
  MIN_NAMES_FONT_SIZE,
} from "@/features/invitations/utils/invitation-styles";
import { serializeInvitation } from "@/features/invitations/utils/serialize-invitation-html";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Link } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { TimePicker } from "@/shared/components/ui/time-picker";

import { defaultInvitation } from "../store/events.store";

import type { EventRecord, Invitation, InvitationLayout } from "../types";

const LAYOUTS: InvitationLayout[] = ["classic", "modern"];
const HEADING_FONTS = [
  "Cormorant Garamond",
  "Playfair Display",
  "Great Vibes",
  "Tangerine",
  "Marcellus",
  "Amiri",
];
const BODY_FONTS = ["Karla", "Montserrat", "Lora", "Cormorant Garamond", "Cairo"];

const ACCENTS = ["#8a6d2f", "#1f6f5c", "#8c2f39", "#2f4858", "#b08968", "#3d3d3d"];
const BACKGROUNDS = ["#fbf8f1", "#ffffff", "#f4efe6", "#eef2ee", "#1b1b1b"];

function normalizeInvitation(inv: Invitation): Invitation {
  const layout = inv.layout === "modern" ? "modern" : "classic";
  const namesFontSize =
    typeof inv.namesFontSize === "number" && Number.isFinite(inv.namesFontSize)
      ? Math.min(MAX_NAMES_FONT_SIZE, Math.max(MIN_NAMES_FONT_SIZE, inv.namesFontSize))
      : DEFAULT_NAMES_FONT_SIZE;
  return {
    ...inv,
    layout,
    namesFontSize,
    language: inv.language === "Arabic" ? "Arabic" : "English",
  };
}

export default function InvitationDesigner({ eventId }: { eventId: string }) {
  const tInv = useTranslations("invitations");
  const t = useTranslations("events");
  const { event, loading } = useEventQuery(eventId);

  if (loading && !event) {
    return <p className="p-8 text-sm text-muted-foreground">{t("loadingEvent")}</p>;
  }

  if (!event) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">{tInv("eventNotFound")}</p>
        <Button asChild variant="outline">
          <Link href={routes.events}>{tInv("backToEvents")}</Link>
        </Button>
      </div>
    );
  }

  return <InvitationDesignerLoaded key={eventId} eventId={eventId} event={event} />;
}

function InvitationDesignerLoaded({ eventId, event }: { eventId: string; event: EventRecord }) {
  const tInv = useTranslations("invitations");
  const {
    invitation: savedInvitation,
    templateId: savedTemplateId,
    loading: invitationLoading,
  } = useEventInvitationFindQuery(eventId);

  if (invitationLoading && !savedInvitation) {
    return <p className="p-8 text-sm text-muted-foreground">{tInv("loading")}</p>;
  }

  const initialInv = normalizeInvitation(savedInvitation ?? defaultInvitation(eventId, event));

  return (
    <InvitationDesignerForm
      key={`${eventId}:${savedInvitation?.eventId ?? "new"}:${savedTemplateId ?? "none"}`}
      eventId={eventId}
      event={event}
      initialInv={initialInv}
      initialTemplateId={savedTemplateId}
      isEditMode={Boolean(savedInvitation)}
    />
  );
}

function InvitationDesignerForm({
  eventId,
  event,
  initialInv,
  initialTemplateId,
  isEditMode,
}: {
  eventId: string;
  event: EventRecord;
  initialInv: Invitation;
  initialTemplateId: string | null;
  isEditMode: boolean;
}) {
  const tInv = useTranslations("invitations");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const canUpdateInvitation = can(INVITATION_PERMISSIONS.update);
  const canCreateInvitation = can(INVITATION_PERMISSIONS.create);
  /** Create new event invitation vs update existing. */
  const canSave = isEditMode ? canUpdateInvitation : canCreateInvitation;
  /** Saving as reusable template requires create. */
  const canSaveReusable = canCreateInvitation;
  const canEditDesign = canSave;

  const { rows: templates } = useInvitationTemplateListQuery({
    pagination: { limit: 100, page: 1 },
  });
  const { saveEventInvitation, saving } = useEventInvitationSaveMutation();

  const [inv, setInv] = useState<Invitation>(initialInv);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplateId);
  const [saveOpen, setSaveOpen] = useState(false);
  const [templateName, setTemplateName] = useState(`${event.name} Invitation`);
  const [exporting, setExporting] = useState(false);
  const [uploadingField, setUploadingField] = useState<"templateImage" | null>(null);
  const [localTemplatePreview, setLocalTemplatePreview] = useState<string | undefined>();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const stylesLocked = Boolean(selectedTemplateId);
  const templatePreviewSrc = localTemplatePreview ?? inv.templateImage;
  const isUploading = uploadingField !== null;

  useEffect(() => {
    return () => {
      if (localTemplatePreview) URL.revokeObjectURL(localTemplatePreview);
    };
    // Only revoke on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional unmount cleanup
  }, []);

  const set = <K extends keyof Invitation>(key: K, value: Invitation[K]) =>
    setInv((prev) => ({ ...prev, [key]: value }));

  function clearLocalTemplatePreview() {
    setLocalTemplatePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return undefined;
    });
  }

  function handleSelectTemplate(templateId: string | null) {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const template = templates.find((row) => row.id === templateId);
    if (!template) return;
    setInv((prev) => normalizeInvitation(injectTemplateStylesIntoInvitation(prev, template)));
    clearLocalTemplatePreview();
    if (template.name) setTemplateName(template.name);
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file || stylesLocked) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalTemplatePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return objectUrl;
    });

    setUploadingField("templateImage");
    try {
      const uploadedUrl = await uploadInvitationImage(file);
      set("templateImage", uploadedUrl);
      // Drop blob preview so live DOM + save both use the Firebase publicUrl.
      clearLocalTemplatePreview();
      toast.success(tInv("imageUploaded"));
    } catch (error) {
      clearLocalTemplatePreview();
      handleError(error, {
        context: {
          feature: "invitations",
          action: "UploadInvitationImage",
          extra: { field: "templateImage" },
        },
        channels: ["toast"],
      });
    } finally {
      setUploadingField(null);
    }
  }

  async function exportPng() {
    setExporting(true);
    try {
      const node = cardRef.current;
      if (!node) throw new Error("Nothing to export");
      if (typeof document !== "undefined" && "fonts" in document) {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      }
      const url = await toPng(node, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.download = `invitation-${inv.brideName}-${inv.groomName}.png`.replace(/\s+/g, "-");
      a.href = url;
      a.click();
      toast.success(tInv("pngExported"));
    } catch {
      toast.error(tInv("exportFailed"));
    } finally {
      setExporting(false);
    }
  }

  function buildHtml(): string | null {
    if (!cardRef.current) return null;
    const templateImageUrl = resolveInvitationImageUrl(inv.templateImage);
    return serializeInvitation(cardRef.current, {
      ...(templateImageUrl ? { templateImageUrl } : {}),
      headingFont: inv.headingFont,
      bodyFont: inv.bodyFont,
    }).html;
  }

  async function handleSave(result: SaveTemplateDialogResult) {
    if (!canSave) return;

    if (isUploading) {
      toast.error(tInv("imageUploadInProgress"));
      return;
    }

    const durableImageUrl = resolveInvitationImageUrl(inv.templateImage);
    // Local blob preview without a finished Firebase upload must not be saved.
    if (localTemplatePreview && !durableImageUrl) {
      toast.error(tInv("imageUploadInProgress"));
      return;
    }

    const html = buildHtml();
    if (!html) {
      toast.error(tInv("saveFailed"));
      return;
    }

    const saveAsReusable = canSaveReusable && result.saveAsReusable;
    if (saveAsReusable && !result.name.trim()) {
      toast.error(tInv("templateNameRequired"));
      return;
    }

    try {
      await saveEventInvitation({
        eventId,
        inv: durableImageUrl ? { ...inv, templateImage: durableImageUrl } : inv,
        html,
        saveAsReusable,
        templateId: selectedTemplateId,
        templateName: saveAsReusable ? result.name.trim() : null,
      });
      if (saveAsReusable) setTemplateName(result.name.trim());
      setSaveOpen(false);
      toast.success(isEditMode ? tInv("invitationUpdated") : tInv("invitationSaved"));
    } catch (error) {
      handleError(error, {
        context: { feature: "invitations", action: "EventInvitationSave" },
        channels: ["toast"],
      });
    }
  }

  return (
    <PermissionGate permission={INVITATION_PERMISSIONS.view}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold">{tInv("invitationStudio")}</h1>
              <p className="text-xs text-muted-foreground">
                {event.name}
                {" · "}
                {isEditMode ? tInv("modeEdit") : tInv("modeCreate")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={exporting} onClick={() => void exportPng()}>
                <Download className="me-1 size-4" />
                {tInv("downloadPng")}
              </Button>
              {canSave ? (
                <Button disabled={saving} onClick={() => setSaveOpen(true)}>
                  {tInv("saveTemplate")}
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="grid gap-6 px-4 py-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-5 border-b bg-background/90 backdrop-blur md:border-b lg:border-r lg:border-b-0">
            <div
              className={cn(
                "space-y-5",
                (!canEditDesign || stylesLocked) && "pointer-events-none opacity-50",
              )}
              inert={!canEditDesign || stylesLocked || undefined}
            >
              <section className="space-y-3">
                <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {tInv("columnLanguage")}
                </h2>
                <div className="grid grid-cols-2 gap-1 rounded-lg p-1">
                  {(["English", "Arabic"] as const).map((language) => {
                    const active = (inv.language ?? "English") === language;
                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => set("language", language)}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-background hover:text-foreground",
                        )}
                      >
                        {language === "English" ? tInv("languageEnglish") : tInv("languageArabic")}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3 p-4">
                <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {tInv("layoutTemplate")}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {LAYOUTS.map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => set("layout", layout)}
                      className={cn(
                        "rounded-md border p-3 text-start transition-colors",
                        inv.layout === layout ? "border-primary bg-accent" : "hover:bg-accent/50",
                      )}
                    >
                      <p className="text-sm font-medium">
                        {layout === "classic" ? tInv("layoutClassic") : tInv("layoutModern")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {layout === "classic"
                          ? tInv("layoutClassicHint")
                          : tInv("layoutModernHint")}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3 p-4">
                <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {tInv("typographyColour")}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>{tInv("namesFont")}</Label>
                    <Select
                      searchable={false}
                      value={inv.headingFont}
                      onValueChange={(value) => {
                        if (value) set("headingFont", value);
                      }}
                      items={HEADING_FONTS.map((font) => ({ value: font, label: font }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{tInv("bodyFont")}</Label>
                    <Select
                      searchable={false}
                      value={inv.bodyFont}
                      onValueChange={(value) => {
                        if (value) set("bodyFont", value);
                      }}
                      items={BODY_FONTS.map((font) => ({ value: font, label: font }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>{tInv("namesFontSize")}</Label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {inv.namesFontSize ?? DEFAULT_NAMES_FONT_SIZE}px
                    </span>
                  </div>
                  <Slider
                    min={MIN_NAMES_FONT_SIZE}
                    max={MAX_NAMES_FONT_SIZE}
                    step={1}
                    value={[inv.namesFontSize ?? DEFAULT_NAMES_FONT_SIZE]}
                    onValueChange={([value]) =>
                      set("namesFontSize", value ?? DEFAULT_NAMES_FONT_SIZE)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>{tInv("accent")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {ACCENTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`${tInv("accent")} ${c}`}
                        onClick={() => set("accent", c)}
                        className={`size-8 rounded-full border-2 ${
                          inv.accent === c ? "border-foreground" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <Input
                      type="color"
                      value={inv.accent}
                      onChange={(e) => set("accent", e.target.value)}
                      className="h-8 w-12 p-1"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{tInv("paper")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {BACKGROUNDS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`${tInv("paper")} ${c}`}
                        onClick={() => set("background", c)}
                        className={`size-8 rounded-full border-2 ${
                          inv.background === c ? "border-foreground" : "border-border"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <Input
                      type="color"
                      value={inv.background}
                      onChange={(e) => set("background", e.target.value)}
                      className="h-8 w-12 p-1"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3 p-4">
                <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {tInv("uploads")}
                </h2>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileImage className="size-4" /> {tInv("backgroundTemplate")}
                  </Label>
                  <p className="text-xs text-muted-foreground">{tInv("backgroundTemplateHint")}</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => {
                        const input = e.currentTarget;
                        void handleImageUpload(input.files?.[0]).finally(() => {
                          input.value = "";
                        });
                      }}
                    />
                    {uploadingField === "templateImage" ? <Spinner size="sm" /> : null}
                    {(inv.templateImage || localTemplatePreview) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isUploading}
                        onClick={() => {
                          clearLocalTemplatePreview();
                          setInv(({ templateImage: _d, ...rest }) => rest);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div
              className={cn("space-y-5", !canEditDesign && "pointer-events-none opacity-50")}
              inert={!canEditDesign || undefined}
            >
              <section className="space-y-3 p-4">
                <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {tInv("wording")}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>{tInv("brideName")}</Label>
                    <Input
                      value={inv.brideName}
                      onChange={(e) => set("brideName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{tInv("groomName")}</Label>
                    <Input
                      value={inv.groomName}
                      onChange={(e) => set("groomName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{tInv("openingLine")}</Label>
                  <Input value={inv.title} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{tInv("message")}</Label>
                  <Textarea
                    rows={3}
                    value={inv.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>{tInv("dateLine")}</Label>
                    <DatePicker
                      value={parseInvitationDateLine(inv.dateLine)}
                      onValueChange={(date) =>
                        set("dateLine", date ? formatInvitationDateLine(date, inv.language) : "")
                      }
                      placeholder={tInv("dateLine")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{tInv("timeLine")}</Label>
                    <TimePicker
                      hourCycle="24"
                      value={parseInvitationTimeLine(inv.timeLine)}
                      onValueChange={(date) => set("timeLine", formatInvitationTimeLine(date))}
                      placeholder={tInv("timeLine")}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{tInv("venueLine")}</Label>
                  <Input value={inv.venueLine} onChange={(e) => set("venueLine", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{tInv("footer")}</Label>
                  <Input value={inv.footer} onChange={(e) => set("footer", e.target.value)} />
                </div>
              </section>
            </div>

            <section className="space-y-3 p-4">
              <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                {tInv("selectSavedTemplate")}
              </h2>
              <Select
                searchable={false}
                disabled={!canEditDesign}
                value={selectedTemplateId ?? ""}
                placeholder={tInv("selectSavedTemplatePlaceholder")}
                onValueChange={(value) => handleSelectTemplate(value || null)}
                items={[
                  { value: "", label: tInv("noSavedTemplate") },
                  ...templates.map((template) => ({
                    value: template.id,
                    label: template.name,
                  })),
                ]}
              />
              {stylesLocked ? (
                <p className="text-xs text-muted-foreground">{tInv("stylesLockedHint")}</p>
              ) : null}
            </section>
          </div>

          <div className="flex min-h-0 flex-col items-center justify-start">
            <div className="w-full max-w-130">
              <p className="mb-2 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {tInv("livePreview")}
              </p>
              <InvitationPreviewCard
                cardRef={cardRef}
                qrLabel={tInv("scanToRsvp")}
                design={{
                  language: inv.language === "Arabic" ? "Arabic" : "English",
                  layout: inv.layout === "modern" ? "modern" : "classic",
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
                  ...(templatePreviewSrc ? { templateImageUrl: templatePreviewSrc } : {}),
                }}
              />
            </div>
          </div>
        </main>

        <SaveTemplateDialog
          open={saveOpen}
          onOpenChange={setSaveOpen}
          defaultName={templateName}
          allowReusable={canSaveReusable}
          saving={saving}
          onSave={handleSave}
        />
      </div>
    </PermissionGate>
  );
}
