"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";

import {
  useContactUsRequestCreate,
  useEventTypeEnumQuery,
} from "@/features/landing/graphql";
import {
  contactFormDefaultValues,
  createContactFormSchema,
  type ContactFormValues,
} from "@/features/landing/schemas/contact-form.schema";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { Form, FormField } from "@/shared/components/forms";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { InternationalPhoneInput } from "@/shared/components/ui/international-phone-input";
import { Select } from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { TimePicker } from "@/shared/components/ui/time-picker";
import { DEFAULT_PHONE_COUNTRY_CODE, toApiDialCode } from "@/shared/utils/international-phone";
import { formatTime24 } from "@/shared/utils/time";

const controlClassName = cn(
  "h-11 border-primary-foreground/35 bg-transparent text-primary-foreground shadow-none",
  "placeholder:text-primary-foreground/45 hover:bg-white/5",
  "focus-visible:border-primary-foreground/70 focus-visible:ring-primary-foreground/20",
);

const triggerClassName = cn(
  controlClassName,
  "justify-start font-normal data-[placeholder]:text-primary-foreground/45",
  "[&_svg]:text-primary-foreground/70",
);

export function ContactSection() {
  const t = useTranslations("landing");
  const { handleError } = useErrorHandler();
  const { options: eventTypeOptions, loading: eventTypesLoading } = useEventTypeEnumQuery();
  const { createRequest, creating } = useContactUsRequestCreate();

  const schema = useMemo(
    () =>
      createContactFormSchema({
        nameRequired: t("contact.validation.nameRequired"),
        emailRequired: t("contact.validation.emailRequired"),
        emailInvalid: t("contact.validation.emailInvalid"),
        phoneRequired: t("contact.validation.phoneRequired"),
        phoneInvalid: t("contact.validation.phoneInvalid"),
        eventTypeRequired: t("contact.validation.eventTypeRequired"),
        dateRequired: t("contact.validation.dateRequired"),
        timeRequired: t("contact.validation.timeRequired"),
        messageRequired: t("contact.validation.messageRequired"),
      }),
    [t],
  );

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema) as Resolver<ContactFormValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      ...contactFormDefaultValues,
      countryCode: DEFAULT_PHONE_COUNTRY_CODE,
    },
  });

  const countryCode =
    useWatch({ control: form.control, name: "countryCode" }) ?? DEFAULT_PHONE_COUNTRY_CODE;

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        if (!values.date || !values.time) {
          toast.error(t("contact.submitError"));
          return;
        }

        const date = format(values.date, "yyyy-MM-dd");
        const time = formatTime24(values.time);
        if (!time) {
          toast.error(t("contact.submitError"));
          return;
        }

        await createRequest({
          customerName: values.customerName.trim(),
          email: values.email.trim(),
          countryCode: toApiDialCode(values.countryCode),
          phoneNumber: values.phoneNumber.trim(),
          eventType: values.eventType,
          date,
          time,
          message: values.message.trim(),
        });

        toast.success(t("contact.submitSuccess"));
        form.reset({
          ...contactFormDefaultValues,
          countryCode: DEFAULT_PHONE_COUNTRY_CODE,
        });
      } catch (error) {
        handleError(error, { context: { feature: "landing", action: "contactUsRequestCreate" } });
      }
    },
    () => {
      toast.error(t("contact.submitError"));
    },
  );

  return (
    <section
      id="contact"
      className="relative isolate scroll-mt-20 overflow-hidden bg-primary py-16 sm:scroll-mt-24 sm:py-20 lg:py-24"
    >
      <Image
        src="/images/natural.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-primary/40" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12">
        <div className="flex flex-col items-start justify-center text-primary-foreground">
          <h2 className="text-start font-display text-[clamp(2.5rem,7vw,3.75rem)] leading-tight font-bold text-primary-foreground">
            {t("contact.title")}
          </h2>
          <p className="mt-5 max-w-md text-start font-sans text-lg leading-relaxed font-normal text-primary-foreground">
            {t("contact.description")}
          </p>

          <ul className="mt-10 flex flex-col items-start gap-4">
            <li>
              <a
                href={`mailto:${t("contact.email")}`}
                className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-[#451523]">
                  <Mail className="size-4" aria-hidden />
                </span>
                <span className="font-sans text-sm sm:text-base" dir="ltr">
                  {t("contact.email")}
                </span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${t("contact.phone").replace(/\s/g, "")}`}
                className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-[#451523]">
                  <Phone className="size-4" aria-hidden />
                </span>
                <span className="font-sans text-sm sm:text-base" dir="ltr">
                  {t("contact.phone")}
                </span>
              </a>
            </li>
            <li className="inline-flex items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-[#451523]">
                <MapPin className="size-4" aria-hidden />
              </span>
              <span className="font-sans text-sm sm:text-base">{t("contact.location")}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-[1.75rem] border border-primary-foreground/10 bg-[#2f0e18]/55 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
          <h3 className="font-display text-[clamp(1.5rem,4vw,1.875rem)] font-bold text-white">
            {t("contact.formTitle")}
          </h3>
          <p className="mt-1.5 font-sans text-sm text-primary-foreground/75">
            {t("contact.formSubtitle")}
          </p>

          <Form {...form}>
            <form
              onSubmit={onSubmit}
              noValidate
              className={cn(
                "mt-8 space-y-4",
                "[&_label]:text-primary-foreground",
                "[&_p.text-destructive]:text-[#ffb4b4]",
                // Phone + select inherit dark `text-foreground` unless forced light on this surface
                "[&_[data-slot=phone-input-field]]:text-primary-foreground",
                "[&_[data-slot=phone-input-field]]:placeholder:text-primary-foreground/45",
                "[&_[data-slot=international-phone-input]]:text-primary-foreground",
                "[&_[data-slot=select-trigger]]:text-primary-foreground",
                "[&_[data-slot=select-trigger]_span.text-muted-foreground]:text-primary-foreground/45",
              )}
            >
              <FormField
                control={form.control}
                name="customerName"
                label={t("contact.fields.name")}
                required
                render={(field) => (
                  <Input
                    autoComplete="name"
                    placeholder={t("contact.placeholders.name")}
                    className={controlClassName}
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="email"
                label={t("contact.fields.email")}
                required
                render={(field) => (
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t("contact.placeholders.email")}
                    className={controlClassName}
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                label={t("contact.fields.phone")}
                required
                render={(field, fieldState) => (
                  <InternationalPhoneInput
                    value={{ countryCode, phone: field.value }}
                    onChange={({ countryCode: nextCountryCode, phone }) => {
                      form.setValue("countryCode", nextCountryCode, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      field.onChange(phone);
                      void form.trigger("phoneNumber");
                    }}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid || undefined}
                    className={cn(controlClassName, "bg-transparent")}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                label={t("contact.fields.eventType")}
                required
                render={(field) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    items={eventTypeOptions}
                    placeholder={t("contact.placeholders.eventType")}
                    searchable={false}
                    disabled={eventTypesLoading}
                    className={triggerClassName}
                  />
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  label={t("contact.fields.date")}
                  required
                  render={(field) => (
                    <DatePicker
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      placeholder={t("contact.placeholders.date")}
                      minDate={new Date()}
                      className={triggerClassName}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  label={t("contact.fields.time")}
                  required
                  render={(field) => (
                    <TimePicker
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      hourCycle="24"
                      placeholder={t("contact.placeholders.time")}
                      className={triggerClassName}
                    />
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                label={t("contact.fields.message")}
                required
                render={(field) => (
                  <Textarea
                    rows={4}
                    placeholder={t("contact.placeholders.message")}
                    className={cn(controlClassName, "h-auto min-h-28 py-2.5")}
                    {...field}
                  />
                )}
              />

              <button
                type="submit"
                disabled={creating}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-foreground font-display text-base font-bold text-[#451523] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? <Spinner size="sm" /> : null}
                {t("cta")}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
