"use client";

import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";

export type SaveTemplateDialogResult = {
  name: string;
  saveAsReusable: boolean;
};

type SaveTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  defaultReusable?: boolean;
  /** When false, hides the reuse checkbox (user lacks create permission). */
  allowReusable?: boolean;
  onSave: (result: SaveTemplateDialogResult) => void | Promise<void>;
  saving?: boolean;
};

export function SaveTemplateDialog({
  open,
  onOpenChange,
  defaultName = "",
  defaultReusable = false,
  allowReusable = true,
  onSave,
  saving = false,
}: SaveTemplateDialogProps) {
  const t = useTranslations("invitations");
  const [name, setName] = useState(defaultName);
  const [saveAsReusable, setSaveAsReusable] = useState(defaultReusable && allowReusable);

  const canSubmit = !saveAsReusable || Boolean(name.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) {
          setName(defaultName);
          setSaveAsReusable(defaultReusable && allowReusable);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("saveTemplateTitle")}</DialogTitle>
          <DialogDescription>{t("saveTemplateDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {allowReusable ? (
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={saveAsReusable}
                onCheckedChange={(checked) => setSaveAsReusable(checked === true)}
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block font-medium">{t("reuseTemplate")}</span>
                <span className="block text-xs text-muted-foreground">
                  {t("reuseTemplateHint")}
                </span>
              </span>
            </label>
          ) : null}
          {saveAsReusable ? (
            <div className="space-y-2">
              <Label htmlFor="template-name">{t("templateName")}</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("templateNamePlaceholder")}
              />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || saving}
            onClick={() =>
              void onSave({
                name: name.trim(),
                saveAsReusable: allowReusable && saveAsReusable,
              })
            }
          >
            {saving ? <Spinner size="sm" className="me-1" /> : null}
            {t("saveTemplate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
