import { z } from "zod";

import { isValidInternationalPhone } from "@/shared/utils/international-phone";

export const securityMemberFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    countryCode: z.string().min(2),
    phone: z.string().trim().min(1, "Phone number is required"),
  })
  .superRefine((values, ctx) => {
    if (!isValidInternationalPhone(values.countryCode, values.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid phone number for the selected country",
      });
    }
  });

export type SecurityMemberFormValues = z.infer<typeof securityMemberFormSchema>;

export const rejectMemberFormSchema = z.object({
  reason: z.string().trim().min(1, "Rejection reason is required"),
});

export type RejectMemberFormValues = z.infer<typeof rejectMemberFormSchema>;
