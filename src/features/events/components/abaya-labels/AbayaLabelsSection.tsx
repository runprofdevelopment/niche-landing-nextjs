"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Tags } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useTranslations } from "@/hooks/useTranslations";
import { Form, FormField } from "@/shared/components/forms";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

import { ABAYA_LABEL_SAMPLE } from "../../domain/abaya-labels";
import { abayaLabelFormSchema } from "../../schemas/event-forms.schema";

import { AbayaLabelPreview } from "./AbayaLabelPreview";

import type { AbayaLabelConfig } from "../../domain/abaya-labels";
import type { AbayaLabelFormValues } from "../../schemas/event-forms.schema";
import type { AbayaLabelBatch } from "../../types";

type AbayaLabelsSectionProps = {
  batch?: AbayaLabelBatch;
  onGenerate: (config: AbayaLabelConfig) => void | Promise<void>;
  canManage?: boolean;
  generating?: boolean;
};

/**
 * Live preview from form values. Falls back to sample only for missing pieces
 * so the card never goes blank while typing.
 */
function toPreviewConfig(values: AbayaLabelFormValues): AbayaLabelConfig {
  const fromRaw = values.from.trim();
  const toRaw = values.to.trim();
  const from = Number(fromRaw);
  const to = Number(toRaw);

  const hasFrom = fromRaw !== "" && Number.isFinite(from) && from > 0;
  const hasTo = toRaw !== "" && Number.isFinite(to) && to > 0;
  const prefix = values.prefix.trim();
  const suffix = values.suffix.trim();

  const resolvedFrom = hasFrom ? from : ABAYA_LABEL_SAMPLE.from;
  const resolvedTo = hasTo
    ? Math.max(to, resolvedFrom)
    : hasFrom
      ? resolvedFrom
      : ABAYA_LABEL_SAMPLE.to;

  return {
    prefix: prefix || ABAYA_LABEL_SAMPLE.prefix,
    // Once the user types a prefix, stop forcing the sample suffix.
    suffix: prefix || suffix ? suffix : ABAYA_LABEL_SAMPLE.suffix,
    from: resolvedFrom,
    to: resolvedTo,
  };
}

export function AbayaLabelsSection({
  batch,
  onGenerate,
  canManage = false,
  generating = false,
}: AbayaLabelsSectionProps) {
  const t = useTranslations("events");

  const form = useForm<AbayaLabelFormValues>({
    resolver: zodResolver(abayaLabelFormSchema),
    defaultValues: {
      prefix: batch?.prefix ?? "",
      suffix: batch?.suffix ?? "",
      from: batch ? String(batch.from) : "",
      to: batch ? String(batch.to) : "",
    },
  });

  // Only re-hydrate when the saved set identity/version changes — not on every
  // Apollo cache-and-network refetch (that would wipe live typing + preview).
  const batchSyncKey = batch
    ? `${batch.id ?? batch.eventId}:${batch.updatedAt ?? batch.generatedAt}:${batch.prefix}:${batch.suffix}:${batch.from}:${batch.to}`
    : "";

  useEffect(() => {
    if (!batch || !batchSyncKey) return;
    form.reset({
      prefix: batch.prefix,
      suffix: batch.suffix,
      from: String(batch.from),
      to: String(batch.to),
    });
  }, [batch, batchSyncKey, form]);

  const watched = useWatch({ control: form.control });
  const previewConfig = toPreviewConfig({
    prefix: watched.prefix ?? "",
    suffix: watched.suffix ?? "",
    from: watched.from ?? "",
    to: watched.to ?? "",
  });

  const handleSubmit = (submitted: AbayaLabelFormValues) => {
    void onGenerate({
      prefix: submitted.prefix.trim(),
      suffix: submitted.suffix.trim(),
      from: Number(submitted.from),
      to: Number(submitted.to),
    });
  };

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PageHeader
          title={t("abayaLabels")}
          description={t("abayaLabelsPageDescription")}
          actions={
            canManage ? (
              <Button type="submit" disabled={generating}>
                <Tags className="size-4" />
                {generating ? t("generatingLabels") : t("generateLabels")}
              </Button>
            ) : null
          }
        />

        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle>{t("labelConfiguration")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="prefix"
              label={t("abayaPrefix")}
              required
              render={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  disabled={!canManage || generating}
                  placeholder={t("abayaPrefixPlaceholder")}
                />
              )}
            />
            <FormField
              control={form.control}
              name="suffix"
              label={t("abayaSuffix")}
              render={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  disabled={!canManage || generating}
                  placeholder={t("abayaSuffixPlaceholder")}
                />
              )}
            />
            <FormField
              control={form.control}
              name="from"
              label={t("abayaFrom")}
              required
              render={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  inputMode="numeric"
                  disabled={!canManage || generating}
                  placeholder={t("abayaFromPlaceholder")}
                />
              )}
            />
            <FormField
              control={form.control}
              name="to"
              label={t("abayaTo")}
              required
              render={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  inputMode="numeric"
                  disabled={!canManage || generating}
                  placeholder={t("abayaToPlaceholder")}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle>{t("labelPreview")}</CardTitle>
            <CardDescription>{t("labelPreviewDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <AbayaLabelPreview config={previewConfig} />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
