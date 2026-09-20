import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string(),
  brideName: z.string(),
  groomName: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  venueName: z.string(),
  expectedGuests: z.number().int().min(0),
  hallCapacity: z.number().int().min(0).optional(),
  hallReference: z.string().optional(),
  address: z.string().optional(),
  googleMapsUrl: z.string().min(1),
  eventType: z.string(),
  language: z.enum(["en", "ar"]),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
