// zod/schemas/user.ts
import * as z from "zod";

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const zipCodeSchema = z.object({
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid US zip code"),
});

export const phoneSchema = z
  .string()
  .regex(/^(\()?([0-9]{3})(\))?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Please enter a valid phone number")
  .optional();
