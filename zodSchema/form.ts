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

export const enhancedPhoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone) return true;
      const cleaned = phone.replace(/\D/g, "");
      return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith("1"));
    },
    { message: "Please enter a valid 10-digit phone number" }
  );

export const pwsidSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{7}$/, "Invalid PWSID format")
  .optional();

export const klavioyoFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: enhancedPhoneSchema,
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid US zip code"),
  pwsid: pwsidSchema,
});

export const formFieldSchemas = {
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone.trim() === "") return true;
        const cleaned = phone.replace(/\D/g, "");
        return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith("1"));
      },
      { message: "Please enter a valid 10-digit phone number" }
    ),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid US zip code"),
  pwsid: z
    .string()
    .optional()
    .refine(
      (pwsid) => {
        if (!pwsid || pwsid.trim() === "") return true;
        return /^[A-Z]{2}\d{7}$/.test(pwsid);
      },
      { message: "Invalid PWSID format (should be 2 letters + 7 digits)" }
    ),
};

export type KlavioyoFormData = z.infer<typeof klavioyoFormSchema>;
export type FormFieldData = {
  [K in keyof typeof formFieldSchemas]: z.infer<(typeof formFieldSchemas)[K]>;
};

export const formatPhoneForKlaviyo = (phone?: string): string | null => {
  if (!phone) return null;

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }

  return null;
};

export const validateFormData = (data: unknown) => {
  return klavioyoFormSchema.safeParse(data);
};

export const validateAndFormatFormData = (rawData: unknown) => {
  const validation = validateFormData(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, phoneNumber, zip, pwsid } = validation.data;

  return {
    success: true,
    data: {
      email,
      phoneNumber: formatPhoneForKlaviyo(phoneNumber),
      zip,
      pwsid: pwsid || undefined,
    },
  };
};
