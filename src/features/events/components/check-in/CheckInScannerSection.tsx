"use client";

import { useState } from "react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import {
  useEventGuestFindByCodeLazyQuery,
  useEventGuestMutations,
} from "@/features/events/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { QrScanner } from "@/shared/components/scanner";
import { Card, CardContent } from "@/shared/components/ui/card";

import { parseScanPayload } from "../../utils/guest-scan";

import { GuestScanResultPanel, type ScannedGuestInfo } from "./GuestScanResultPanel";

type CheckInScannerSectionProps = {
  eventId: string;
};

/**
 * Check-in feature scanner: guest QR → EventGuestFindByCode → guest info panel.
 */
export function CheckInScannerSection({ eventId }: CheckInScannerSectionProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const canCheckIn = can(EVENT_PERMISSIONS.checkIn);
  const { checkInGuest, checkingIn } = useEventGuestMutations(eventId);
  const { findGuestByCode, loading: findingGuest } = useEventGuestFindByCodeLazyQuery();

  const [scannedInfo, setScannedInfo] = useState<ScannedGuestInfo | null>(null);
  const [paused, setPaused] = useState(false);

  const handleScan = async (raw: string) => {
    const parsed = parseScanPayload(raw);

    if (parsed.kind === "table") {
      toast.message(t("scanTableNotSupportedHere"));
      return;
    }

    const code = parsed.value.trim();
    if (!code) {
      toast.error(t("scanGuestNotFound"));
      setScannedInfo(null);
      return;
    }

    setPaused(true);
    try {
      const guest = await findGuestByCode(eventId, code);
      if (!guest?.id) {
        toast.error(t("scanGuestNotFound"));
        setScannedInfo(null);
        setPaused(false);
        return;
      }

      setScannedInfo({
        id: guest.id,
        name: guest.name?.trim() || "",
        email: guest.email?.trim() || "",
        code,
      });
    } catch (error) {
      setScannedInfo(null);
      setPaused(false);
      handleError(error, {
        context: {
          feature: "events",
          action: "EventGuestFindByCode",
          extra: { eventId, code },
        },
        channels: ["toast"],
      });
    }
  };

  const handleCheckIn = async () => {
    if (!scannedInfo?.code) {
      toast.error(t("checkInCodeMissing"));
      return;
    }
    try {
      await checkInGuest(scannedInfo.code);
      toast.success(t("guestCheckedIn"));
      setScannedInfo((current) => (current ? { ...current, checkedIn: true } : null));
    } catch (error) {
      handleError(error, {
        context: {
          feature: "events",
          action: "EventGuestCheckIn",
          extra: { eventId, code: scannedInfo.code, guestId: scannedInfo.id },
        },
        channels: ["toast"],
      });
    }
  };

  const handleScanAgain = () => {
    setScannedInfo(null);
    setPaused(false);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("qrCodeScanner")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("qrCodeScannerDescription")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <QrScanner
              onScan={(raw) => {
                void handleScan(raw);
              }}
              paused={paused || findingGuest}
            />
            {paused ? (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={handleScanAgain}
                >
                  {t("scanAgain")}
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <GuestScanResultPanel
          info={scannedInfo}
          loading={findingGuest}
          onCheckIn={() => {
            void handleCheckIn();
          }}
          canCheckIn={canCheckIn && !checkingIn}
        />
      </div>
    </section>
  );
}
