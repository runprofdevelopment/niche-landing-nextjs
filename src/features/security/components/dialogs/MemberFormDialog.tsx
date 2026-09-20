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
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  resolvePhoneFormValue,
} from "@/shared/utils/international-phone";

import {
  securityMemberFormSchema,
  type SecurityMemberFormValues,
} from "../../schemas/member.schema";

import type { SecurityMember } from "../../types";

type MemberFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  member?: SecurityMember | null;
  onSubmit: (values: SecurityMemberFormValues) => void | Promise<void>;
};

const DEFAULT_VALUES: SecurityMemberFormValues = {
  name: "",
  email: "",
  countryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phone: "",
};

export function MemberFormDialog({
  open,
  onOpenChange,
  mode,
  member,
  onSubmit,
}: MemberFormDialogProps) {
  const t = useTranslations("security");
  const tCommon = useTranslations("common");
  const form = useForm<SecurityMemberFormValues>({
    resolver: zodResolver(securityMemberFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const countryCode =
    useWatch({ control: form.control, name: "countryCode" }) ?? DEFAULT_PHONE_COUNTRY_CODE;

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && member) {
      const phone = resolvePhoneFormValue(member.phone, member.countryCode);
      form.reset({
        name: member.name,
        email: member.email,
        countryCode: phone.countryCode,
        phone: phone.phone,
      });
      return;
    }
    form.reset(DEFAULT_VALUES);
  }, [open, mode, member, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pe-12">
          <DialogTitle>{mode === "edit" ? t("editMemberTitle") : t("addMemberTitle")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
              <FormField
                control={form.control}
                name="name"
                label={t("memberNameLabel")}
                required
                render={(field) => (
                  <Input {...field} placeholder={t("memberNamePlaceholder")} autoComplete="name" />
                )}
              />

              <FormField
                control={form.control}
                name="email"
                label={t("memberEmailLabel")}
                required
                render={(field) => (
                  <Input
                    type="email"
                    {...field}
                    placeholder={t("memberEmailPlaceholder")}
                    autoComplete="email"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                label={t("memberPhoneLabel")}
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
            </div>

            <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
