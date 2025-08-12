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

export interface WaterSystem {
  pwsid: string;
  pws_name: string;
  org_name?: string;
  owner_type_code: string;
  population_served_count: number;
  gw_sw_code: string;
  primary_source_code: string;
  city_name?: string;
  state_code?: string;
  zip_code?: string;
  admin_name?: string;
  email_addr?: string;
  phone_number?: string;
}

export const formSubmissionSchema = z.object({
  email: emailSchema.shape.email,
  phoneNumber: phoneSchema.or(z.literal("").optional()).optional(),
  zip: zipCodeSchema.shape.zipCode.transform((v) => v),
  pwsid: z.string().trim().optional(),
});

export type FormSubmission = z.infer<typeof formSubmissionSchema>;
