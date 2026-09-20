"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useTranslations } from "@/hooks/useTranslations";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { InternationalPhoneInput } from "@/shared/components/ui/international-phone-input";
import { Label } from "@/shared/components/ui/label";
import { QuantityInput } from "@/shared/components/ui/quantity-input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  resolvePhoneFormValue,
} from "@/shared/utils/international-phone";

import {
  guestDetailsFormSchema,
  type GuestDetailsFormValues,
} from "../../schemas/event-forms.schema";

import type { Guest } from "../../types";

type GuestFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  guest?: Guest | null;
  onSubmit: (values: GuestDetailsFormValues) => void | Promise<void>;
};

const DEFAULT_VALUES: GuestDetailsFormValues = {
  name: "",
  companions: 0,
  email: "",
  countryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phone: "",
  gender: "male",
};

export function GuestFormDialog({
  open,
  onOpenChange,
  mode,
  guest,
  onSubmit,
}: GuestFormDialogProps) {
  const t = useTranslations("events");
  const form = useForm<GuestDetailsFormValues>({
    resolver: zodResolver(guestDetailsFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const countryCode =
    useWatch({ control: form.control, name: "countryCode" }) ?? DEFAULT_PHONE_COUNTRY_CODE;
  const companions = useWatch({ control: form.control, name: "companions" }) ?? 0;

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && guest) {
      const phone = resolvePhoneFormValue(guest.phone, guest.countryCode);
      form.reset({
        name: guest.name,
        companions: guest.numberOfCompanions ?? 0,
        email: guest.email ?? "",
        countryCode: phone.countryCode,
        phone: phone.phone,
        gender: guest.gender ?? "male",
      });
      return;
    }
    form.reset(DEFAULT_VALUES);
  }, [open, mode, guest, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pe-12">
          <DialogTitle>{mode === "edit" ? t("editGuestTitle") : t("addGuestTitle")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
              <FormField
                control={form.control}
                name="name"
                label={t("guestNameLabel")}
                required
                render={(field) => <Input {...field} placeholder={t("guestNamePlaceholderFull")} />}
              />

              <FormField
                control={form.control}
                name="email"
                label={t("guestEmailLabel")}
                render={(field) => (
                  <Input type="email" {...field} placeholder={t("guestEmailPlaceholder")} />
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                label={t("guestPhoneLabel")}
                required
                render={(field, fieldState) => (
                  <InternationalPhoneInput
                    value={{
                      countryCode,
                      phone: field.value,
                    }}
                    onChange={({ countryCode: nextCountryCode, phone }) => {
                      form.setValue("countryCode", nextCountryCode, { shouldValidate: true });
                      field.onChange(phone);
                    }}
                    aria-invalid={fieldState.invalid || undefined}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                label={t("guestGenderLabel")}
                render={(field) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row flex-wrap gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="guest-gender-male" />
                      <Label htmlFor="guest-gender-male" className="font-normal">
                        {t("genderMale")}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="guest-gender-female" />
                      <Label htmlFor="guest-gender-female" className="font-normal">
                        {t("genderFemale")}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="NA" id="guest-gender-na" />
                      <Label htmlFor="guest-gender-na" className="font-normal">
                        {t("genderNA")}
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
              <div className="grid grid-cols-1">
                <FormField
                  control={form.control}
                  name="companions"
                  label={t("guestCompanionsLabel")}
                  description={t("guestCompanionsHint")}
                  render={(field, fieldState) => (
                    <QuantityInput
                      size="default"
                      min={0}
                      fullWidth
                      max={50}
                      value={companions}
                      onValueChange={(value) => field.onChange(value ?? 0)}
                      aria-invalid={fieldState.invalid || undefined}
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button type="button" variant="outline-invert" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit">{mode === "edit" ? t("actionEdit") : t("addGuest")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
