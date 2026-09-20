"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";

export type ScannedGuestInfo = {
  id: string;
  name: string;
  email: string;
  code: string;
  checkedIn?: boolean;
};

type GuestScanResultPanelProps = {
  info: ScannedGuestInfo | null;
  loading?: boolean;
  onCheckIn: () => void;
  emptyMessage?: string;
  canCheckIn?: boolean;
};

export function GuestScanResultPanel({
  info,
  loading = false,
  onCheckIn,
  emptyMessage,
  canCheckIn = true,
}: GuestScanResultPanelProps) {
  const t = useTranslations("events");
  const alreadyCheckedIn = Boolean(info?.checkedIn);

  const rows = info
    ? [
        { label: t("scanGuestName"), value: info.name || t("emptyValue") },
        { label: t("columnEmail"), value: info.email || t("emptyValue") },
        { label: t("checkInCodeLabel"), value: info.code || t("emptyValue") },
      ]
    : [];

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">{t("guestInformation")}</h2>

      {loading ? (
        <div className="mt-8 flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : info ? (
        <>
          <dl className="mt-4 flex-1 space-y-0">
            {rows.map((row, index) => (
              <div key={row.label}>
                {index > 0 ? <Separator /> : null}
                <div className="flex items-center justify-between gap-4 py-3 text-sm">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium text-foreground">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex justify-end">
            {canCheckIn ? (
              <Button onClick={onCheckIn} disabled={alreadyCheckedIn}>
                {alreadyCheckedIn ? t("alreadyCheckedIn") : t("checkInGuestButton")}
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">{emptyMessage ?? t("scanGuestEmpty")}</p>
      )}
    </div>
  );
}
