"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { routes } from "@/constants/routes";
import { useEventMutations, useEventTypeEnumQuery } from "@/features/events/graphql";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/features/events/schemas/event-forms.schema";
import { useInfiniteOwners } from "@/features/registration-users/services";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
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

type CreateEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select owner after marking a registration user as owner. */
  defaultOwnerId?: string;
  defaultOwnerLabel?: string;
};

function createDefaultValues(ownerId = ""): EventFormValues {
  return {
    name: "",
    brideName: "",
    groomName: "",
    ownerId,
    date: "",
    startTime: "",
    endTime: "",
    hallCapacity: 30,
    expectedGuests: 30,
    eventType: "",
    language: "",
    hallReference: "",
    address: "",
    googleMapsUrl: "",
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

export function CreateEventDialog({
  open,
  onOpenChange,
  defaultOwnerId = "",
  defaultOwnerLabel,
}: CreateEventDialogProps) {
  const t = useTranslations("events");
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { createEvent } = useEventMutations();
  const { options: eventTypeOptions, loading: eventTypesLoading } = useEventTypeEnumQuery();
  const [ownerSearch, setOwnerSearch] = useState("");
  const {
    options: ownerOptions,
    loading: ownersLoading,
    hasMore: ownersHasMore,
    loadMore: loadMoreOwners,
  } = useInfiniteOwners({ search: ownerSearch, skip: !open });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: createDefaultValues(defaultOwnerId),
  });
  const selectedEventType = useWatch({ control: form.control, name: "eventType" });
  const selectedLanguage = useWatch({ control: form.control, name: "language" });
  const selectedOwnerId = useWatch({ control: form.control, name: "ownerId" });
  const languageOptions = [
    { value: "en", label: t("languageEnglish") },
    { value: "ar", label: t("languageArabic") },
  ];

  const selectedOwnerOption = useMemo(() => {
    if (!selectedOwnerId) return null;
    const fromList = ownerOptions.find((option) => option.value === selectedOwnerId);
    if (fromList) return fromList;
    if (defaultOwnerId && selectedOwnerId === defaultOwnerId && defaultOwnerLabel) {
      return { value: defaultOwnerId, label: defaultOwnerLabel };
    }
    return { value: selectedOwnerId, label: selectedOwnerId };
  }, [defaultOwnerId, defaultOwnerLabel, ownerOptions, selectedOwnerId]);

  useEffect(() => {
    if (!open) return;
    form.reset(createDefaultValues(defaultOwnerId));
  }, [defaultOwnerId, form, open]);

  const handleOpenChange = (next: boolean) => {
    if (next) setOwnerSearch("");
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const address = values.address.trim();
    const hallRef = values.hallReference.trim();
    const googleMapUrl = values.googleMapsUrl.trim();

    try {
      const ev = await createEvent({
        name: values.name.trim() || t("untitledEvent"),
        brideName: values.brideName.trim(),
        groomName: values.groomName.trim(),
        ownerId: values.ownerId.trim(),
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        address,
        numberOfGuests: values.expectedGuests,
        hallCapacity: values.hallCapacity,
        eventType: values.eventType,
        language: values.language,
        googleMapUrl,
        ...(hallRef ? { hallRef } : {}),
      });

      form.reset(createDefaultValues());
      handleOpenChange(false);
      router.push(routes.event(ev.id));
    } catch (error) {
      handleError(error, { context: { feature: "events", action: "eventCreate" } });
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t("createNewEventTitle")}</DialogTitle>
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
                  onValueChange={(value) => field.onChange(value ?? "")}
                  items={ownerOptions}
                  selectedOption={selectedOwnerOption}
                  loading={ownersLoading}
                  hasMore={ownersHasMore}
                  onLoadMore={loadMoreOwners}
                  onSearchChange={setOwnerSearch}
                  placeholder={t("selectOwner")}
                  disabled={Boolean(defaultOwnerId)}
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
                  onValueChange={(value) => field.onChange(value ?? "")}
                  items={eventTypeOptions}
                  disabled={eventTypesLoading || eventTypeOptions.length === 0}
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
                  onValueChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                  placeholder={t("selectDate")}
                  minDate={new Date()}
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
                    onValueChange={(date) => field.onChange(formatTime24(date) ?? "")}
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
                    onValueChange={(date) => field.onChange(formatTime24(date) ?? "")}
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
                    onValueChange={(value) => field.onChange(value ?? 1)}
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
                    onValueChange={(value) => field.onChange(value ?? 1)}
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
                    onValueChange={(value) => field.onChange(value ?? "")}
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
              required
              render={(field) => <Input placeholder={t("googleMapsUrlPlaceholder")} {...field} />}
            />

            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  eventTypesLoading ||
                  !selectedEventType ||
                  !selectedLanguage ||
                  !selectedOwnerId
                }
              >
                {t("createEventButton")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
