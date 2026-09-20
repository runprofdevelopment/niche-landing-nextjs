"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Badge, Card, CardContent, CardHeader, CardTitle, DetailRow } from "@/shared/components";

import type { ContactUsRequest } from "../types";

type RequestEventDetailsProps = {
  request: ContactUsRequest;
};

export function RequestEventDetails({ request }: RequestEventDetailsProps) {
  const t = useTranslations("requests");
  const emptyValue = t("emptyValue");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("eventDetailsTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex min-w-0 flex-col gap-4">
          <DetailRow
            label={t("fieldEventType")}
            border
            value={
              request.eventType ? (
                <Badge variant="secondary" className="capitalize">
                  {request.eventType}
                </Badge>
              ) : (
                emptyValue
              )
            }
          />
          <DetailRow label={t("fieldDate")} value={request.date || emptyValue} border />
          <DetailRow label={t("fieldTime")} value={request.time || emptyValue} />
        </div>
      </CardContent>
    </Card>
  );
}
