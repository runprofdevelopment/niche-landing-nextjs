"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components";

import type { ContactUsRequest } from "../types";

type RequestAdditionalNotesProps = {
  request: ContactUsRequest;
};

export function RequestAdditionalNotes({ request }: RequestAdditionalNotesProps) {
  const t = useTranslations("requests");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("additionalNotesTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {request.message || t("emptyValue")}
        </p>
      </CardContent>
    </Card>
  );
}
