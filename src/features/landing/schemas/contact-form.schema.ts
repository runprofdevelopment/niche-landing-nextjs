import { z } from "zod";

import {
  DEFAULT_PHONE_COUNTRY_CODE,
  isValidInternationalPhone,
} from "@/shared/utils/international-phone";

export type ContactFormValidationMessages = {
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  phoneInvalid: string;
  eventTypeRequired: string;
  dateRequired: string;
  timeRequired: string;
  messageRequired: string;
};

const defaultMessages: ContactFormValidationMessages = {
  nameRequired: "Full name is required",
  emailRequired: "Email is required",
  emailInvalid: "Enter a valid email address",
  phoneRequired: "Phone number is required",
  phoneInvalid: "Enter a valid phone number for the selected country",
  eventTypeRequired: "Select an event type",
  dateRequired: "Date is required",
  timeRequired: "Time is required",
  messageRequired: "Message is required",
};

export function createContactFormSchema(
  messages: ContactFormValidationMessages = defaultMessages,
) {
  return z
    .object({
      customerName: z.string().trim().min(1, messages.nameRequired),
      email: z
        .string()
        .trim()
        .min(1, messages.emailRequired)
        .email(messages.emailInvalid),
      countryCode: z.string().min(2),
      phoneNumber: z.string().trim().min(1, messages.phoneRequired),
      eventType: z.string().min(1, messages.eventTypeRequired),
      date: z.date().nullable(),
      time: z.date().nullable(),
      message: z.string().trim().min(1, messages.messageRequired),
    })
    .superRefine((values, ctx) => {
      if (!values.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["date"],
          message: messages.dateRequired,
        });
      }

      if (!values.time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["time"],
          message: messages.timeRequired,
        });
      }

      if (
        values.phoneNumber.trim().length > 0 &&
        !isValidInternationalPhone(values.countryCode, values.phoneNumber)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phoneNumber"],
          message: messages.phoneInvalid,
        });
      }
    });
}

export const contactFormSchema = createContactFormSchema();

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactFormDefaultValues: ContactFormValues = {
  customerName: "",
  email: "",
  countryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phoneNumber: "",
  eventType: "",
  date: null,
  time: null,
  message: "",
};
