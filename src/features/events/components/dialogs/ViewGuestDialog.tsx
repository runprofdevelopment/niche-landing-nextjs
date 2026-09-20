"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import type { Guest, GuestStatus } from "../../types";
import type { ReactNode } from "react";

type ViewGuestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Guest | null;
  tableLabel?: string;
  seatLabel?: string;
  onEdit?: () => void;
};

function statusLabel(t: (key: string) => string, status: GuestStatus | undefined) {
  switch (status) {
    case "confirmed":
      return t("statusConfirmed");
    case "cancelled":
      return t("statusCancelled");
    default:
      return t("statusExpected");
  }
}

function genderLabel(t: (key: string) => string, gender: Guest["gender"]) {
  if (gender === "female") return t("genderFemale");
  if (gender === "male") return t("genderMale");
  if (gender === "NA") return t("genderNA");
  return "—";
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-start gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ViewGuestDialog({
  open,
  onOpenChange,
  guest,
  tableLabel,
  seatLabel,
  onEdit,
}: ViewGuestDialogProps) {
  const t = useTranslations("events");
  if (!guest) return null;

  const companions = guest.companions ?? [];
  const tableValue = guest.tableNumber || tableLabel || "—";
  const seatValue = guest.seatNumber || seatLabel || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle>{t("viewGuestTitle")}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-6 py-5">
          <DetailRow label={t("guestNameLabel")} value={guest.name || "—"} />
          <DetailRow
            label={t("columnCompanions")}
            value={String(guest.numberOfCompanions ?? companions.length)}
          />
          <DetailRow label={t("guestEmailLabel")} value={guest.email || "—"} />
          <DetailRow label={t("guestPhoneLabel")} value={guest.phone || "—"} />
          <DetailRow label={t("guestGenderLabel")} value={genderLabel(t, guest.gender)} />
          <DetailRow label={t("columnAbayaLabel")} value={guest.abayaLabel || t("notAvailable")} />
          <DetailRow label={t("columnGuestCode")} value={guest.code || "—"} />
          <DetailRow label={t("columnTableNumber")} value={tableValue} />
          <DetailRow label={t("columnSeatNumber")} value={seatValue} />
          <DetailRow
            label={t("columnGuestStatus")}
            value={
              <Badge variant="secondary" className="font-normal">
                {statusLabel(t, guest.status)}
              </Badge>
            }
          />

          {companions.length > 0 ? (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-sm font-medium text-foreground">{t("companionsListTitle")}</p>
              <ul className="space-y-2">
                {companions.map((companion) => (
                  <li
                    key={companion.id}
                    className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground"
                  >
                    {companion.name?.trim() || t("unnamedCompanion")}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button type="button" variant="outline-invert" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          {onEdit ? (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
            >
              {t("actionEdit")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
