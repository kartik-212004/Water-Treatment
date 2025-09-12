import { redirect } from "next/navigation";

import { ApiKeySession, ProfileCreateQuery, ProfileEnum, ProfilesApi } from "klaviyo-api";
import { Mail, Phone } from "lucide-react";

import { formSubmissionSchema } from "@/lib/form-schema";
import prisma from "@/lib/prisma";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SubmitButton from "../../modules/home/SubmitButton";
import WaterProviderPicker from "../../modules/home/WaterProviderPicker";

const session = new ApiKeySession(process.env.KLAVIYO_API_KEY || "");
const profilesApi = new ProfilesApi(session);

function formatPhoneNumber(phone: string | undefined | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith("1")) return `+${cleaned}`;
  if (phone.startsWith("+")) return phone;
  return null;
}

async function submitForm(formData: FormData) {
  "use server";

  if (!process.env.KLAVIYO_API_KEY) {
    throw new Error("Server configuration error: KLAVIYO_API_KEY is not set");
  }

  const email = String(formData.get("email") || "").trim();
  const phoneNumber = String(formData.get("phoneNumber") || "").trim();
  const zipCode = String(formData.get("zipCode") || "").trim();
  const pwsidRaw = String(formData.get("pwsid") || "").trim();
  const consent = formData.get("consent");

  if (!consent) {
    throw new Error("Consent is required");
  }

  const parsed = formSubmissionSchema.parse({
    email,
    phoneNumber: phoneNumber || undefined,
    zip: zipCode,
    pwsid: pwsidRaw || undefined,
  });

  const profileAttributes: Record<string, any> = {
    email: parsed.email,
    location: { zip: parsed.zip },
  };

  if (parsed.phoneNumber) {
    const formattedPhone = formatPhoneNumber(parsed.phoneNumber);
    if (formattedPhone) profileAttributes.phone_number = formattedPhone;
  }
  if (parsed.pwsid) profileAttributes.properties = { pwsid: parsed.pwsid };

  const profile: ProfileCreateQuery = {
    data: { type: ProfileEnum.Profile, attributes: profileAttributes },
  };

  const upsertLead = async () => {
    let phoneBigInt: bigint | undefined;
    if (parsed.phoneNumber) {
      const digits = parsed.phoneNumber.replace(/\D/g, "");
      if (digits) phoneBigInt = BigInt(digits);
    }
    await prisma.leads.upsert({
      where: { email: parsed.email },
      update: { pwsid: parsed.pwsid || undefined, phone_number: phoneBigInt, zip_code: parsed.zip },
      create: {
        email: parsed.email,
        pwsid: parsed.pwsid || undefined,
        phone_number: phoneBigInt,
        zip_code: parsed.zip,
      },
    });
  };

  try {
    const response = await profilesApi.createProfile(profile);
    if (!response.body?.data) {
      // Even if create didn't return data, persist lead
      await upsertLead();
    } else {
      await upsertLead();
    }
  } catch (profileError: any) {
    if (
      profileError.response?.status === 409 &&
      profileError.response?.data?.errors?.[0]?.code === "duplicate_profile"
    ) {
      const duplicateProfileId = profileError.response.data.errors[0].meta?.duplicate_profile_id;
      try {
        await profilesApi.updateProfile(duplicateProfileId, {
          data: { type: ProfileEnum.Profile, id: duplicateProfileId, attributes: profileAttributes },
        });
        await upsertLead();
      } catch (updateError) {
        await upsertLead();
      }
    } else {
      throw profileError;
    }
  }

  const pwsidToUse = pwsidRaw || "";
  redirect(
    `/report?pwsid=${encodeURIComponent(pwsidToUse)}&zipcode=${encodeURIComponent(zipCode)}&email=${encodeURIComponent(email)}`
  );
}

export default function WaterQualityReport() {
  return (
    <div className="relative bg-white pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden rounded-sm border-none border-gray-200 shadow-none sm:border sm:shadow-xl">
            <CardContent className="bg-white px-0 py-8 sm:p-8">
              <form action={submitForm} className="space-y-4">
                <div className="space-y-6">
                  {/* ZIP and Provider Picker (client-side UX) */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="zipCode"
                      className="text-sm font-semibold uppercase tracking-wider text-black">
                      Zip Code *
                    </Label>
                    <WaterProviderPicker zipFieldName="zipCode" pwsidFieldName="pwsid" />
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="email"
                      className="text-[11px] font-semibold uppercase tracking-wide text-black md:text-sm">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        className="h-10 rounded-lg border-2 bg-white pl-9 text-base text-black transition-all duration-200 placeholder:text-sm md:h-14 md:rounded-xl md:pl-12 md:text-lg md:placeholder:text-base"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-[11px] font-semibold uppercase tracking-wide text-black md:text-sm">
                      Mobile Number (Optional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="h-10 rounded-lg border-2 bg-white pl-9 text-base text-black transition-all duration-200 placeholder:text-sm md:h-14 md:rounded-xl md:pl-12 md:text-lg md:placeholder:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Consent */}
                <div className="flex items-start space-x-4 rounded-xl bg-gray-50 p-5 md:p-6">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    required
                    className="mt-1 h-4 w-4 rounded-sm border border-gray-300"
                  />
                  <Label htmlFor="consent" className="text-[13px] leading-relaxed text-gray-700 md:text-sm">
                    I agree to receive email and SMS marketing communications from 4Patriots about water
                    filtration products and health tips. I understand I can unsubscribe at any time.
                  </Label>
                </div>

                <SubmitButton className="group relative h-12 w-full transform rounded-lg bg-[#B40014] text-base font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#8F0010] md:h-16 md:rounded-xl md:text-lg" />
              </form>
            </CardContent>
          </Card>
          <div className="mt-5 text-center md:mt-6">
            <p className="text-[11px] text-gray-500 md:text-xs">
              By submitting, you agree to receive communications about water filtration solutions. You can opt
              out anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
