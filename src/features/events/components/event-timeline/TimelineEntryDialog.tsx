"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useTranslations } from "@/hooks/useTranslations";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { TimePicker } from "@/shared/components/ui/time-picker";
import { formatTime24, parseTime24 } from "@/shared/utils/time";

import { timelineSlotFormSchema } from "../../schemas/event-forms.schema";

import type { TimelineSlotFormValues } from "../../schemas/event-forms.schema";
import type { TimelineSlot } from "../../types";

const DEFAULT_START = "08:00";
const DEFAULT_END = "10:00";

type TimelineEntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; omitted to add a new entry. */
  slot?: TimelineSlot | null;
  onSubmit: (values: TimelineSlotFormValues) => void | Promise<void>;
};

export function TimelineEntryDialog({
  open,
  onOpenChange,
  slot,
  onSubmit,
}: TimelineEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Remounts per entry so the form seeds from `slot` without a reset effect. */}
        {open ? (
          <TimelineEntryForm
            key={slot?.id ?? "new"}
            {...(slot ? { slot } : {})}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type TimelineEntryFormProps = {
  slot?: TimelineSlot;
  onSubmit: (values: TimelineSlotFormValues) => void | Promise<void>;
  onCancel: () => void;
};

function TimelineEntryForm({ slot, onSubmit, onCancel }: TimelineEntryFormProps) {
  const t = useTranslations("events");
  const editing = Boolean(slot);

  const form = useForm<TimelineSlotFormValues>({
    resolver: zodResolver(timelineSlotFormSchema),
    defaultValues: {
      title: slot?.title ?? "",
      description: slot?.description ?? "",
      start: slot?.start ?? DEFAULT_START,
      end: slot?.end ?? DEFAULT_END,
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? t("editTimelineEntry") : t("addTimelineEntry")}</DialogTitle>
        <DialogDescription>{t("addTimelineEntryDescription")}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 border-t border-border pt-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* The form keeps 24h "HH:mm"; the picker works in `Date`s. */}
            <FormField
              control={form.control}
              name="start"
              label={t("startTime")}
              required
              render={(field) => (
                <TimePicker
                  hourCycle="24"
                  value={parseTime24(field.value)}
                  onValueChange={(date) => field.onChange(formatTime24(date) ?? "")}
                />
              )}
            />
            <FormField
              control={form.control}
              name="end"
              label={t("endTime")}
              required
              render={(field) => (
                <TimePicker
                  hourCycle="24"
                  value={parseTime24(field.value)}
                  onValueChange={(date) => field.onChange(formatTime24(date) ?? "")}
                />
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            label={t("title")}
            required
            render={(field) => <Input {...field} placeholder={t("timelineTitlePlaceholder")} />}
          />

          <FormField
            control={form.control}
            name="description"
            label={t("description")}
            render={(field) => (
              <Textarea {...field} rows={3} placeholder={t("timelineDescriptionPlaceholder")} />
            )}
          />

          <DialogFooter className="border-t border-border pt-6">
            <Button type="button" variant="outline-invert" onClick={onCancel}>
              {t("cancel")}
            </Button>
            <Button type="submit">{editing ? t("saveChanges") : t("addEntry")}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
