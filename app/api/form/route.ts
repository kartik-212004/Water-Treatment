import { NextResponse, NextRequest } from "next/server";

import { ApiKeySession, ProfileCreateQuery, ProfileEnum, ProfilesApi } from "klaviyo-api";

import prisma from "@/lib/prisma";

import { formSubmissionSchema, FormSubmission } from "@/zodSchema/form";

const session = new ApiKeySession(process.env.KLAVIYO_API_KEY || "");
const profilesApi = new ProfilesApi(session);

function formatPhoneNumber(phone: string | undefined | null): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }

  if (phone.startsWith("+")) {
    return phone;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.KLAVIYO_API_KEY) {
      console.error("KLAVIYO_API_KEY environment variable is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Parse & validate request body
    const json = await req.json();
    const { email, phoneNumber, zip, pwsid } = formSubmissionSchema.parse(json) as FormSubmission;

    const profileAttributes: Record<string, any> = {
      email,
      location: { zip },
    };

    if (phoneNumber) {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (formattedPhone) {
        profileAttributes.phone_number = formattedPhone;
      } else {
        console.warn("Invalid phone number format, skipping:", phoneNumber);
      }
    }

    if (pwsid) {
      profileAttributes.properties = { pwsid };
    }

    const profile: ProfileCreateQuery = {
      data: {
        type: ProfileEnum.Profile,
        attributes: profileAttributes,
      },
    };

    console.log("Creating profile with data:", JSON.stringify(profile, null, 2));

    try {
      const response = await profilesApi.createProfile(profile);
      const created = response.body?.data;

      let phoneBigInt: bigint | undefined;
      if (phoneNumber) {
        const digits = phoneNumber.replace(/\D/g, "");
        if (digits) phoneBigInt = BigInt(digits);
      }

      await prisma.leads.upsert({
        where: { email },
        update: { pwsid: pwsid || undefined, phone_number: phoneBigInt, zip_code: zip },
        create: { email, pwsid: pwsid || undefined, phone_number: phoneBigInt, zip_code: zip },
      });

      return NextResponse.json({
        success: true,
        profile: created
          ? {
              id: created.id,
              type: created.type,
              attributes: created.attributes,
            }
          : null,
        message: "Profile created successfully",
      });
    } catch (profileError: any) {
      if (
        profileError.response?.status === 409 &&
        profileError.response?.data?.errors?.[0]?.code === "duplicate_profile"
      ) {
        const duplicateProfileId = profileError.response.data.errors[0].meta?.duplicate_profile_id;

        console.log("Profile already exists, attempting to update:", duplicateProfileId);

        try {
          const updateResponse = await profilesApi.updateProfile(duplicateProfileId, {
            data: {
              type: ProfileEnum.Profile,
              id: duplicateProfileId,
              attributes: profileAttributes,
            },
          });

          const updatedProfileData = {
            id: updateResponse.body?.data?.id,
            type: updateResponse.body?.data?.type,
            attributes: updateResponse.body?.data?.attributes,
          };

          return NextResponse.json({
            success: true,
            profile: updatedProfileData,
            message: "Profile updated successfully",
          });
        } catch (updateError: any) {
          console.error("Error updating profile:", updateError);

          return NextResponse.json({
            success: true,
            profileId: duplicateProfileId,
            message: "Profile already exists",
          });
        }
      }

      throw profileError;
    }
  } catch (error: any) {
    console.error("Error creating Klaviyo profile:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
      console.error("Response headers:", error.response.headers);
    }

    if (error.config) {
      console.error("Request config:", {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data,
      });
    }

    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to create Klaviyo profile",
        details: errorMessage,
        status: error.response?.status,
      },
      { status: 500 }
    );
  }
}
