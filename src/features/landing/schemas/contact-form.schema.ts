import { z } from "zod";

import {
  DEFAULT_PHONE_COUNTRY_CODE,
  isValidInternationalPhone,
} from "@/shared/utils/international-phone";

export const contactFormSchema = z
  .object({
    customerName: z.string().trim().min(1),
    email: z.string().trim().email(),
    countryCode: z.string().min(2),
    phoneNumber: z.string().trim().min(1),
    eventType: z.string().min(1),
    date: z.date().nullable(),
    time: z.date().nullable(),
    message: z.string().trim().min(1),
  })
  .superRefine((values, ctx) => {
    if (!values.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "required",
      });
    }

    if (!values.time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["time"],
        message: "required",
      });
    }

    if (!isValidInternationalPhone(values.countryCode, values.phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "invalid",
      });
    }
  });

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
