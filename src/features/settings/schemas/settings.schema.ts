import { z } from "zod";

import { validateInternationalPhone } from "@/shared/utils/international-phone";
import { isPasswordValid } from "@/shared/utils/password-rules";

const PHONE_VALIDATION_MESSAGES = {
  required: "Phone number is required",
  country_mismatch: "Phone number does not match the selected country",
  invalid_length: "Phone number length is invalid for the selected country",
  invalid: "Enter a valid phone number for the selected country",
} as const;

export const profileSettingsSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your name"),
    email: z.string().trim().email(),
    countryCode: z.string().min(2),
    phone: z.string().trim().min(1, "Phone number is required"),
  })
  .superRefine((values, ctx) => {
    const result = validateInternationalPhone(values.countryCode, values.phone);
    if (result.valid) return;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: PHONE_VALIDATION_MESSAGES[result.reason],
    });
  });

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .refine(isPasswordValid, { message: "Password does not meet requirements" }),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.oldPassword !== values.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
