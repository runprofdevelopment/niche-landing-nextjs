"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useEventMutations, useEventTypeEnumQuery } from "@/features/events/graphql";
import {
  editEventFormSchema,
  type EventFormValues,
} from "@/features/events/schemas/event-forms.schema";
import { useInfiniteOwners } from "@/features/registration-users/services";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { InfiniteSelect } from "@/shared/components/ui/infinite-select";
import { Input } from "@/shared/components/ui/input";
import { QuantityInput } from "@/shared/components/ui/quantity-input";
import { Select } from "@/shared/components/ui/select";
import { TimePicker } from "@/shared/components/ui/time-picker";
import { formatTime24, parseTime24 } from "@/shared/utils/time";

import type { EventRecord } from "@/features/events/types";

/** Normalize API date (`yyyy-MM-dd` or ISO) for the form / DatePicker. */
function normalizeDateValue(value: string): string {
  if (!value) return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match?.[1] ?? "";
}

/** Normalize API time (`HH:mm`, `HH:mm:ss`, etc.) to `HH:mm` for TimePicker. */
function normalizeTimeValue(value: string): string {
  const date = parseTime24(value);
  return formatTime24(date) ?? "";
}

function createFormState(event: EventRecord): EventFormValues {
  return {
    name: event.name,
    brideName: event.brideName,
    groomName: event.groomName,
    ownerId: event.ownerId ?? "",
    date: normalizeDateValue(event.date),
    startTime: normalizeTimeValue(event.startTime),
    endTime: normalizeTimeValue(event.endTime),
    hallCapacity: event.hallCapacity ?? event.expectedGuests,
    expectedGuests: event.expectedGuests,
    eventType: event.eventType || "",
    language: (() => {
      const lang = event.language?.trim().toLowerCase();
      return lang === "ar" || lang === "en" ? lang : "";
    })(),
    hallReference: event.hallReference ?? "",
    address: (event.address ?? event.venueName ?? "").trim(),
    googleMapsUrl: event.googleMapsUrl ?? "",
  };
}

function parseDateValue(value: string): Date | null {
  if (!value) return null;
  try {
    return parseISO(value);
  } catch {
    return null;
  }
}

type EditEventDialogProps = {
  event: EventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EditEventDialogContentProps = {
  event: EventRecord;
  onOpenChange: (open: boolean) => void;
};

function EditEventDialogContent({ event, onOpenChange }: EditEventDialogContentProps) {
  const t = useTranslations("events");
  const { handleError } = useErrorHandler();
  const { updateEvent, updating } = useEventMutations();
  const { options: eventTypeOptions, loading: eventTypesLoading } = useEventTypeEnumQuery();
  const [ownerSearch, setOwnerSearch] = useState("");
  const {
    options: ownerOptions,
    loading: ownersLoading,
    hasMore: ownersHasMore,
    loadMore: loadMoreOwners,
  } = useInfiniteOwners({ search: ownerSearch });
  const languageOptions = [
    { value: "en", label: t("languageEnglish") },
    { value: "ar", label: t("languageArabic") },
  ];

  const form = useForm<EventFormValues>({
    resolver: zodResolver(editEventFormSchema),
    defaultValues: createFormState(event),
    shouldFocusError: true,
  });
  const { isSubmitting } = form.formState;
  const selectedOwnerId = useWatch({ control: form.control, name: "ownerId" });
  const selectedEventType = useWatch({ control: form.control, name: "eventType" });

  const eventTypeItems = useMemo(() => {
    const value = selectedEventType?.trim();
    if (!value || eventTypeOptions.some((option) => option.value === value)) {
      return eventTypeOptions;
    }
    return [{ value, label: value }, ...eventTypeOptions];
  }, [eventTypeOptions, selectedEventType]);

  const selectedOwnerOption = useMemo(() => {
    if (!selectedOwnerId) return null;
    const fromList = ownerOptions.find((option) => option.value === selectedOwnerId);
    if (fromList) return fromList;
    if (event.ownerId && selectedOwnerId === event.ownerId && event.customerName) {
      return { value: event.ownerId, label: event.customerName };
    }
    return { value: selectedOwnerId, label: event.customerName || selectedOwnerId };
  }, [event.customerName, event.ownerId, ownerOptions, selectedOwnerId]);

  // Remount via `key={event.id}` seeds defaults; avoid resetting on cache identity churn.
  useEffect(() => {
    form.reset(createFormState(event));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the event id changes
  }, [event.id]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      const address = values.address.trim();
      const hallRef = values.hallReference.trim();
      const googleMapUrl = values.googleMapsUrl.trim();
      try {
        await updateEvent(event.id, {
          name: values.name.trim() || t("untitledEvent"),
          brideName: values.brideName.trim(),
          groomName: values.groomName.trim(),
          ownerId: values.ownerId.trim(),
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          numberOfGuests: values.expectedGuests,
          hallCapacity: values.hallCapacity,
          eventType: values.eventType,
          language: values.language,
          googleMapUrl: googleMapUrl || null,
          ...(address ? { address } : {}),
          ...(hallRef ? { hallRef } : {}),
        });
        onOpenChange(false);
      } catch (error) {
        handleError(error, { context: { feature: "events", action: "updateEvent" } });
      }
    },
    (errors) => {
      const firstErrorName = Object.keys(errors)[0];
      if (!firstErrorName) return;
      const el = document.querySelector(`[name="${firstErrorName}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">{t("editEvent")}</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            label={t("eventName")}
            required
            render={(field) => <Input placeholder={t("eventNamePlaceholder")} {...field} />}
          />
          <FormField
            control={form.control}
            name="ownerId"
            label={t("ownerLabel")}
            required
            render={(field) => (
              <InfiniteSelect
                value={field.value || null}
                onValueChange={(value) => form.setValue("ownerId", value ?? "")}
                items={ownerOptions}
                selectedOption={selectedOwnerOption}
                loading={ownersLoading}
                hasMore={ownersHasMore}
                onLoadMore={loadMoreOwners}
                onSearchChange={setOwnerSearch}
                placeholder={t("selectOwner")}
              />
            )}
          />
          <FormField
            control={form.control}
            name="eventType"
            label={t("eventType")}
            required
            render={(field) => (
              <Select
                value={field.value || null}
                onValueChange={(value) => form.setValue("eventType", value ?? "")}
                items={eventTypeItems}
                disabled={eventTypesLoading && eventTypeItems.length === 0}
                placeholder={t("selectEventType")}
              />
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="brideName"
              label={t("brideName")}
              required
              render={(field) => <Input placeholder={t("brideNamePlaceholder")} {...field} />}
            />
            <FormField
              control={form.control}
              name="groomName"
              label={t("groomName")}
              required
              render={(field) => <Input placeholder={t("groomNamePlaceholder")} {...field} />}
            />
          </div>

          <FormField
            control={form.control}
            name="date"
            label={t("eventDate")}
            required
            render={(field) => (
              <DatePicker
                value={parseDateValue(field.value)}
                onValueChange={(date) =>
                  form.setValue("date", date ? format(date, "yyyy-MM-dd") : "")
                }
                placeholder={t("selectDate")}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startTime"
              label={t("startTime")}
              required
              render={(field) => (
                <TimePicker
                  hourCycle="24"
                  value={parseTime24(field.value)}
                  onValueChange={(date) => form.setValue("startTime", formatTime24(date) ?? "")}
                  placeholder={t("selectTime")}
                />
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              label={t("endTime")}
              required
              render={(field) => (
                <TimePicker
                  hourCycle="24"
                  value={parseTime24(field.value)}
                  onValueChange={(date) => form.setValue("endTime", formatTime24(date) ?? "")}
                  placeholder={t("selectTime")}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="hallCapacity"
              label={t("hallCapacity")}
              required
              render={(field) => (
                <QuantityInput
                  size="default"
                  min={1}
                  value={field.value}
                  onValueChange={(value) => form.setValue("hallCapacity", value ?? 1)}
                />
              )}
            />
            <FormField
              control={form.control}
              name="expectedGuests"
              label={t("numberOfGuests")}
              required
              render={(field) => (
                <QuantityInput
                  size="default"
                  min={1}
                  value={field.value}
                  onValueChange={(value) => form.setValue("expectedGuests", value ?? 1)}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1">
            <FormField
              control={form.control}
              name="language"
              label={t("language")}
              required
              render={(field) => (
                <Select
                  value={field.value || null}
                  onValueChange={(value) =>
                    form.setValue("language", (value ?? "") as EventFormValues["language"])
                  }
                  items={languageOptions}
                  placeholder={t("selectLanguage")}
                />
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hallReference"
            label={t("hallReference")}
            render={(field) => <Input placeholder={t("addressPlaceholder")} {...field} />}
          />

          <FormField
            control={form.control}
            name="address"
            label={t("address")}
            required
            render={(field) => <Input placeholder={t("addressPlaceholder")} {...field} />}
          />

          <FormField
            control={form.control}
            name="googleMapsUrl"
            label={t("googleMapsUrl")}
            render={(field) => <Input placeholder={t("googleMapsUrlPlaceholder")} {...field} />}
          />

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" loading={updating} disabled={updating || isSubmitting}>
              {t("saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

export function EditEventDialog({ event, open, onOpenChange }: EditEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {open && event ? (
          <EditEventDialogContent key={event.id} event={event} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
