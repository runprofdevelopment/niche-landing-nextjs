import { z } from "zod";

import { isValidInternationalPhone } from "@/shared/utils/international-phone";

import { ABAYA_LABEL_MAX_COUNT } from "../domain/abaya-labels";

/** Parse `yyyy-MM-dd` as a local calendar date (no UTC shift). */
function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Parse `HH:mm` into minutes from midnight. */
function parseTimeMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const eventFormFields = {
  name: z.string().trim().min(1, "Event name is required"),
  brideName: z.string().trim().min(1, "Bride name is required"),
  groomName: z.string().trim().min(1, "Groom name is required"),
  ownerId: z.string().trim().min(1, "Owner is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hallCapacity: z.coerce.number().int().min(1, "Hall capacity must be at least 1"),
  expectedGuests: z.coerce.number().int().min(1, "Number of guests must be at least 1"),
  /** Backend `eventTypeEnum` id — no default; user must pick. */
  eventType: z.string().trim().min(1, "Event type is required"),
  /** Content language: `en` | `ar` — empty until user picks. */
  language: z.literal("").or(z.enum(["en", "ar"])),
  hallReference: z.string(),
  address: z.string().trim().min(1, "Address is required"),
  googleMapsUrl: z.string(),
};

function refineEventFormTimes(
  values: { language: string; startTime: string; endTime: string },
  ctx: z.RefinementCtx,
) {
  if (values.language === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["language"],
      message: "Language is required",
    });
  }
  if (values.endTime === values.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "End time must be different from start time",
    });
  }
}

/** Create flow — also rejects past dates / past start times. */
export const eventFormSchema = z
  .object({
    ...eventFormFields,
    googleMapsUrl: z.string().trim().min(1, "Google Maps URL is required"),
  })
  .superRefine((values, ctx) => {
    refineEventFormTimes(values, ctx);
    // Overnight events (e.g. 19:00 → 00:00) are allowed: end before start means next calendar day.

    const now = new Date();
    const today = startOfLocalDay(now);
    const eventDate = parseLocalDate(values.date);

    if (eventDate && eventDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Date cannot be before today",
      });
    }

    if (eventDate && eventDate.getTime() === today.getTime()) {
      const startMinutes = parseTimeMinutes(values.startTime);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (startMinutes != null && startMinutes < nowMinutes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startTime"],
          message: "Start time cannot be in the past for today's date",
        });
      }
    }
  });

/**
 * Edit flow — same required fields as create, but allows existing past dates/times
 * and an empty Maps URL (many events were saved without one).
 */
export const editEventFormSchema = z.object(eventFormFields).superRefine((values, ctx) => {
  refineEventFormTimes(values, ctx);
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const createGroupFormSchema = z.object({
  name: z.string().trim().min(1, "Family or group name is required"),
});

export type CreateGroupFormValues = z.infer<typeof createGroupFormSchema>;

export const addGuestFormSchema = z.object({
  name: z.string().trim().min(1, "Guest name is required"),
  familyId: z.string(),
});

export type AddGuestFormValues = z.infer<typeof addGuestFormSchema>;

export const guestDetailsFormSchema = z
  .object({
    name: z.string().trim().min(1, "Guest name is required"),
    companions: z.coerce.number().int().min(0).max(50),
    email: z.string().trim(),
    countryCode: z.string().min(2),
    phone: z.string().trim().min(1, "Phone number is required"),
    gender: z.enum(["male", "female", "NA"]),
  })
  .superRefine((values, ctx) => {
    if (values.email && !z.string().email().safeParse(values.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter a valid email address",
      });
    }
    if (!isValidInternationalPhone(values.countryCode, values.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid phone number for the selected country",
      });
    }
  });

export type GuestDetailsFormValues = z.infer<typeof guestDetailsFormSchema>;

/** Times are 24h "HH:mm" — the entry lives on the event's date. */
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Select a valid time");

export const timelineSlotFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string(),
  start: timeString,
  end: timeString,
});

export type TimelineSlotFormValues = z.infer<typeof timelineSlotFormSchema>;

/** Kept as digit strings so the inputs stay plain text and the preview can read them live. */
const labelBound = z.string().trim().regex(/^\d+$/, "Enter a whole number");

export const abayaLabelFormSchema = z
  .object({
    prefix: z.string().trim().min(1, "Prefix is required"),
    suffix: z.string(),
    from: labelBound,
    to: labelBound,
  })
  .superRefine((values, ctx) => {
    const from = Number(values.from);
    const to = Number(values.to);

    if (from < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["from"],
        message: "Start at 1 or higher",
      });
    }
    if (to < from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "To must be greater than or equal to From",
      });
    }
    if (to - from + 1 > ABAYA_LABEL_MAX_COUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: `Range cannot exceed ${ABAYA_LABEL_MAX_COUNT} labels`,
      });
    }
  });

export type AbayaLabelFormValues = z.infer<typeof abayaLabelFormSchema>;

/** `kind` starts empty so the member select stays disabled until a role is picked. */
export const eventStaffFormSchema = z
  .object({
    kind: z.literal("").or(z.enum(["staff", "frontdesk"])),
    memberId: z.string(),
    notes: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["kind"],
        message: "Select a role",
      });
    }
    if (!values.memberId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["memberId"],
        message: "Select a member",
      });
    }
  });

export type EventStaffFormValues = z.infer<typeof eventStaffFormSchema>;

export const guestCheckInFormSchema = z.object({
  code: z.string().trim().min(1, "Enter a guest code or name"),
});

export type GuestCheckInFormValues = z.infer<typeof guestCheckInFormSchema>;

export const phoneFormSchema = z
  .object({
    countryCode: z.string().min(2),
    phoneNumber: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!isValidInternationalPhone(values.countryCode, values.phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Enter a valid phone number for the selected country",
      });
    }
  });

export type PhoneFormValues = z.infer<typeof phoneFormSchema>;
