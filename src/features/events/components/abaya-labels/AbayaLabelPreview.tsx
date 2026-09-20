"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Separator } from "@/shared/components/ui/separator";

import { abayaLabelDigits, abayaSuffixBadge, formatAbayaLabel } from "../../domain/abaya-labels";

import type { AbayaLabelConfig } from "../../domain/abaya-labels";

type AbayaLabelPreviewProps = {
  config: AbayaLabelConfig;
};

/** Single printed label, rendered from the first number in the range. */
export function AbayaLabelPreview({ config }: AbayaLabelPreviewProps) {
  const t = useTranslations("events");

  const firstCode = formatAbayaLabel(config, config.from);
  const lastCode = formatAbayaLabel(config, config.to);
  const numberBadge = String(Math.trunc(config.from)).padStart(abayaLabelDigits(config.to), "0");
  const prefixBadge = abayaSuffixBadge(config.prefix) || config.prefix.trim();
  const suffixBadge = abayaSuffixBadge(config.suffix);

  return (
    <div className="w-full max-w-xs rounded-xl border border-border bg-card p-5 text-center shadow-sm">
      <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
        {t("abayaLabelTag")}
      </p>

      <Separator className="my-3" />

      <p className="font-display text-2xl font-semibold break-all">{firstCode}</p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <PreviewChip label={t("abayaPrefix")} value={prefixBadge} />
        <PreviewChip label={t("abayaNumber")} value={numberBadge} />
        {suffixBadge ? <PreviewChip label={t("abayaSuffix")} value={suffixBadge} /> : null}
      </div>

      <Separator className="my-3" />

      <p className="text-xs text-muted-foreground">
        {t("abayaRangeLabel")}: <span className="font-medium">{firstCode}</span>
        {" → "}
        <span className="font-medium">{lastCode}</span>
      </p>
    </div>
  );
}

function PreviewChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </span>
  );
}
