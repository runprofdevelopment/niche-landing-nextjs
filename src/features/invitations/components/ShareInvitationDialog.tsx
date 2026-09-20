"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";

import type { InvitationGuestIds } from "../types";

const ALL_VALUE = "all";

type ShareGuestOption = {
  id: string;
  name: string;
};

type ShareInvitationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: ShareGuestOption[];
  onShare: (guestIds: InvitationGuestIds) => void;
  sharing?: boolean;
};

export function ShareInvitationDialog({
  open,
  onOpenChange,
  guests,
  onShare,
  sharing = false,
}: ShareInvitationDialogProps) {
  const t = useTranslations("invitations");
  const [target, setTarget] = useState<string>(ALL_VALUE);

  const items = useMemo(
    () => [
      { value: ALL_VALUE, label: t("shareAllGuests") },
      ...guests.map((guest) => ({ value: guest.id, label: guest.name })),
    ],
    [guests, t],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setTarget(ALL_VALUE);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shareInvitation")}</DialogTitle>
          <DialogDescription>{t("shareInvitationDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Label>{t("shareRecipients")}</Label>
          <Select
            searchable={guests.length > 8}
            value={target}
            placeholder={t("shareRecipientsPlaceholder")}
            onValueChange={(value) => setTarget(value ?? ALL_VALUE)}
            items={items}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={sharing || guests.length === 0}
            onClick={() => onShare(target === ALL_VALUE ? "all" : target)}
          >
            {t("shareInvitation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
