"use client";

import { toPng } from "html-to-image";
import { ArrowLeft, Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { INVITATION_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/providers/i18n";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Textarea } from "@/shared/components/ui/textarea";

import { InvitationPreviewCard } from "../components/InvitationPreviewCard";
import {
  SaveTemplateDialog,
  type SaveTemplateDialogResult,
} from "../components/SaveTemplateDialog";
import { createBlankTemplate } from "../data/mock-templates";
import { useInvitationsStore } from "../store/invitations.store";
import {
  DEFAULT_NAMES_FONT_SIZE,
  MAX_NAMES_FONT_SIZE,
  MIN_NAMES_FONT_SIZE,
} from "../utils/invitation-styles";
import { serializeInvitation } from "../utils/serialize-invitation-html";

import type { InvitationLanguage, InvitationLayout, InvitationTemplate } from "../types";

const LAYOUTS: InvitationLayout[] = ["classic", "modern"];
const HEADING_FONTS = [
  "Playfair Display",
  "Great Vibes",
  "Cormorant Garamond",
  "Amiri",
  "Marcellus",
];
const BODY_FONTS = ["Lora", "Montserrat", "Cairo", "Karla", "Cormorant Garamond"];
const ACCENTS = ["#602234", "#8B2252", "#8a6d2f", "#1f6f5c", "#2f4858", "#3d3d3d"];

type TemplateStudioViewProps = {
  templateId?: string;
};

export default function TemplateStudioView({ templateId }: TemplateStudioViewProps) {
  const t = useTranslations("invitations");
  const { can } = usePermissions();
  const canSaveTemplate = templateId
    ? can(INVITATION_PERMISSIONS.update)
    : can(INVITATION_PERMISSIONS.create);
  const router = useRouter();
  const getTemplate = useInvitationsStore((state) => state.getTemplate);
  const createTemplate = useInvitationsStore((state) => state.createTemplate);
  const updateTemplate = useInvitationsStore((state) => state.updateTemplate);

  const existing = templateId ? getTemplate(templateId) : undefined;
  const [design, setDesign] = useState<InvitationTemplate>(() => existing ?? createBlankTemplate());
  const [saveOpen, setSaveOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const patch = <K extends keyof InvitationTemplate>(key: K, value: InvitationTemplate[K]) =>
    setDesign((prev) => ({ ...prev, [key]: value }));

  const designFields = useMemo(
    () => ({
      language: design.language,
      layout: design.layout,
      headingFont: design.headingFont,
      bodyFont: design.bodyFont,
      namesFontSize: design.namesFontSize || DEFAULT_NAMES_FONT_SIZE,
      accent: design.accent,
      background: design.background,
      title: design.title,
      message: design.message,
      dateLine: design.dateLine,
      timeLine: design.timeLine,
      venueLine: design.venueLine,
      footer: design.footer,
      brideName: design.brideName,
      groomName: design.groomName,
    }),
    [design],
  );

  async function handleDownloadPng() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      if (typeof document !== "undefined" && "fonts" in document) {
        await document.fonts.ready;
      }
      const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${design.name || "invitation"}.png`.replace(/\s+/g, "-");
      a.click();
      toast.success(t("pngExported"));
    } catch {
      toast.error(t("exportFailed"));
    } finally {
      setExporting(false);
    }
  }

  function handleSaveTemplate({ name }: SaveTemplateDialogResult) {
    const payload = cardRef.current ? serializeInvitation(cardRef.current) : null;
    const html = payload?.html ?? "";
    const css = payload?.css ?? "";
    if (existing) {
      updateTemplate(existing.id, { ...design, name, html, css });
      toast.success(t("templateSaved"));
    } else {
      const created = createTemplate({ ...design, name, html, css });
      toast.success(t("templateSaved"));
      router.replace(routes.invitationTemplateEdit(created.id));
    }
    setSaveOpen(false);
  }

  return (
    <PermissionGate permission={INVITATION_PERMISSIONS.view}>
      <div className="min-h-[70vh] space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={routes.invitations}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl font-semibold">{t("invitationStudio")}</h1>
              <p className="text-sm text-muted-foreground">{t("createTemplateHint")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={exporting} onClick={handleDownloadPng}>
              <Download className="me-1 size-4" />
              {t("downloadPng")}
            </Button>
            {canSaveTemplate ? (
              <Button variant="outline" onClick={() => setSaveOpen(true)}>
                {t("saveTemplate")}
              </Button>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div
            className={cn(
              "space-y-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm",
              !canSaveTemplate && "pointer-events-none opacity-50",
            )}
          >
            <div className="space-y-2">
              <Label>{t("templateName")}</Label>
              <Input value={design.name} onChange={(e) => patch("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("columnLanguage")}</Label>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
                {(["English", "Arabic"] as const).map((language) => {
                  const active = design.language === language;
                  return (
                    <button
                      key={language}
                      type="button"
                      onClick={() => patch("language", language as InvitationLanguage)}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-background hover:text-foreground",
                      )}
                    >
                      {language === "English" ? t("languageEnglish") : t("languageArabic")}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("layoutTemplate")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => patch("layout", layout)}
                    className={cn(
                      "rounded-md border p-3 text-start transition-colors",
                      design.layout === layout ? "border-primary bg-accent" : "hover:bg-accent/50",
                    )}
                  >
                    <p className="text-sm font-medium">
                      {layout === "classic" ? t("layoutClassic") : t("layoutModern")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {layout === "classic" ? t("layoutClassicHint") : t("layoutModernHint")}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("brideName")}</Label>
                <Input
                  value={design.brideName}
                  onChange={(e) => patch("brideName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("groomName")}</Label>
                <Input
                  value={design.groomName}
                  onChange={(e) => patch("groomName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("openingLine")}</Label>
              <Input value={design.title} onChange={(e) => patch("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("message")}</Label>
              <Textarea value={design.message} onChange={(e) => patch("message", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("footer")}</Label>
              <Input value={design.footer} onChange={(e) => patch("footer", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("columnFontNames")}</Label>
              <Select
                searchable={false}
                value={design.headingFont}
                onValueChange={(value) => {
                  if (value) patch("headingFont", value);
                }}
                items={HEADING_FONTS.map((font) => ({ value: font, label: font }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("columnFontBody")}</Label>
              <Select
                searchable={false}
                value={design.bodyFont}
                onValueChange={(value) => {
                  if (value) patch("bodyFont", value);
                }}
                items={BODY_FONTS.map((font) => ({ value: font, label: font }))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{t("namesFontSize")}</Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {design.namesFontSize || DEFAULT_NAMES_FONT_SIZE}px
                </span>
              </div>
              <Slider
                min={MIN_NAMES_FONT_SIZE}
                max={MAX_NAMES_FONT_SIZE}
                step={1}
                value={[design.namesFontSize || DEFAULT_NAMES_FONT_SIZE]}
                onValueChange={([value]) =>
                  patch("namesFontSize", value ?? DEFAULT_NAMES_FONT_SIZE)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("columnAccentColor")}</Label>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    className={`size-8 rounded-full border-2 ${
                      design.accent === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => patch("accent", color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {t("livePreview")}
            </p>
            <div className="w-full max-w-130">
              <InvitationPreviewCard
                design={{
                  ...designFields,
                  ...(design.templateImageUrl ? { templateImageUrl: design.templateImageUrl } : {}),
                }}
                cardRef={cardRef}
                qrLabel={t("scanToRsvp")}
              />
            </div>
          </div>
        </div>

        {canSaveTemplate ? (
          <SaveTemplateDialog
            open={saveOpen}
            onOpenChange={setSaveOpen}
            defaultName={design.name}
            defaultReusable
            allowReusable={can(INVITATION_PERMISSIONS.create)}
            onSave={handleSaveTemplate}
          />
        ) : null}
      </div>
    </PermissionGate>
  );
}
