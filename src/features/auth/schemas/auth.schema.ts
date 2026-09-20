import { z } from "zod";

import { validateInternationalPhone } from "@/shared/utils/international-phone";
import { isPasswordValid } from "@/shared/utils/password-rules";

import { AUTH_DEPARTMENTS } from "../constants/departments";

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .refine(isPasswordValid, { message: "Password does not meet requirements" });

const departmentValues = AUTH_DEPARTMENTS.map((item) => item.value) as [
  (typeof AUTH_DEPARTMENTS)[number]["value"],
  ...(typeof AUTH_DEPARTMENTS)[number]["value"][],
];

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const PHONE_VALIDATION_MESSAGES = {
  required: "Phone number is required",
  country_mismatch: "Phone number does not match the selected country",
  invalid_length: "Phone number length is invalid for the selected country",
  invalid: "Enter a valid phone number for the selected country",
} as const;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email address"),
    countryCode: z.string().min(2),
    phone: z.string().trim().min(1, "Phone number is required"),
    department: z.enum(departmentValues, { message: "Select a department" }),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms and privacy policy",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Enter the 6-digit verification code")
    .regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
