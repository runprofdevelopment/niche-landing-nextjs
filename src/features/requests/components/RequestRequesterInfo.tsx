"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle, DetailRow } from "@/shared/components";

import type { ContactUsRequest } from "../types";

type RequestRequesterInfoProps = {
  request: ContactUsRequest;
};

export function RequestRequesterInfo({ request }: RequestRequesterInfoProps) {
  const t = useTranslations("requests");
  const emptyValue = t("emptyValue");
  const phone =
    request.countryCode && request.phoneNumber
      ? `${request.countryCode} ${request.phoneNumber}`
      : request.phoneNumber || emptyValue;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("requesterInfoTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex min-w-0 flex-col gap-4">
          <DetailRow label={t("fieldName")} value={request.customerName || emptyValue} border />
          <DetailRow label={t("fieldPhone")} value={phone} border />
          <DetailRow label={t("fieldEmail")} value={request.email || emptyValue} />
        </div>
      </CardContent>
    </Card>
  );
}
