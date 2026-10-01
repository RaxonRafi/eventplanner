import { z } from "zod";

const imageUrl = z
  .string()
  .trim()
  .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Banner must be an https URL");

export const PackageInput = z.object({
  id: z.string().min(1).optional(), // present when editing an existing package
  name: z.string().trim().min(2, "Package name is required").max(60),
  price: z.number().positive("Price must be greater than 0").max(1_000_000),
});

/** Shared shape for creating and editing an event (dates are ISO strings). */
export const EventInput = z.object({
  title: z.string().trim().min(3, "Title is required").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
  date: z.coerce.date(),
  location: z.string().trim().min(2, "Location is required").max(200),
  capacity: z.number().int().positive().max(1_000_000).nullable().optional(),
  bannerImage: imageUrl.nullable().optional(),
  packages: z.array(PackageInput).min(1, "At least one package is required").max(10),
});

export type EventInputType = z.infer<typeof EventInput>;

/** First validation message, for a friendly API error. */
export function firstIssue(err: z.ZodError) {
  const i = err.issues[0];
  return i ? `${i.path.join(".") || "body"}: ${i.message}` : "Invalid request";
}
