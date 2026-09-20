"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type { Guest } from "../../types";

type CheckInGuestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Guest | null;
  familyName: string;
  onCheckIn: (guestId: string, code: string) => void;
};

type CheckInGuestDialogBodyProps = {
  guest: Guest;
  familyName: string;
  onOpenChange: (open: boolean) => void;
  onCheckIn: (guestId: string, code: string) => void;
};

function CheckInGuestDialogBody({
  guest,
  familyName,
  onOpenChange,
  onCheckIn,
}: CheckInGuestDialogBodyProps) {
  const t = useTranslations("events");
  const [code, setCode] = useState(guest.code ?? "");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const payload = guest.code || guest.id;

    void QRCode.toDataURL(payload, { width: 220, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [guest.code, guest.id]);

  const alreadyCheckedIn = Boolean(guest.checkedInAt) && !guest.checkedOutAt;
  const checkInTime = guest.checkedInAt
    ? new Date(guest.checkedInAt).toLocaleString()
    : t("emptyValue");

  const handleConfirm = () => {
    const expected = (guest.code ?? "").trim().toLowerCase();
    const entered = code.trim().toLowerCase();
    if (expected && entered && entered !== expected) {
      toast.error(t("checkInCodeMismatch"));
      return;
    }
    onCheckIn(guest.id, code.trim());
    onOpenChange(false);
  };

  return (
    <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pe-12">
        <DialogTitle className="font-display text-xl">{t("guestCheckInTitle")}</DialogTitle>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("guestNameLabel")}
            </p>
            <p className="mt-1 text-sm font-medium">{guest.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("guestFamilyNameLabel")}
            </p>
            <p className="mt-1 text-sm font-medium">{familyName || t("emptyValue")}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("guestEmailLabel")}
            </p>
            <p className="mt-1 text-sm font-medium break-all">{guest.email || t("emptyValue")}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {t("guestPhoneLabel")}
            </p>
            <p className="mt-1 text-sm font-medium">{guest.phone || t("emptyValue")}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- generated data URL
              <img src={qrDataUrl} alt="" width={200} height={200} className="size-[200px]" />
            ) : (
              <div className="flex size-[200px] items-center justify-center text-sm text-muted-foreground">
                {t("qrUnavailable")}
              </div>
            )}
          </div>
          <p className="font-medium">{t("scanQrToCheckIn")}</p>
          <p className="text-sm text-muted-foreground">
            {t("checkInTimeLabel")}: {checkInTime}
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="check-in-code">{t("checkInCodeLabel")}</Label>
          <Input
            id="check-in-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t("checkInCodePlaceholder")}
          />
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
        <Button type="button" variant="outline-invert" onClick={() => onOpenChange(false)}>
          {t("cancel")}
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={alreadyCheckedIn}>
          {alreadyCheckedIn ? t("alreadyCheckedIn") : t("checkInAction")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function CheckInGuestDialog({
  open,
  onOpenChange,
  guest,
  familyName,
  onCheckIn,
}: CheckInGuestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {guest ? (
        <CheckInGuestDialogBody
          key={guest.id}
          guest={guest}
          familyName={familyName}
          onOpenChange={onOpenChange}
          onCheckIn={onCheckIn}
        />
      ) : null}
    </Dialog>
  );
}
