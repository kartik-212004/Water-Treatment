import { NextResponse, NextRequest } from "next/server";

import { ApiKeySession, ProfileCreateQuery, ProfileEnum, ProfilesApi } from "klaviyo-api";

const session = new ApiKeySession(process.env.KLAVIYO_API_KEY || "");
const profilesApi = new ProfilesApi(session);

// Phone number validation and formatting
function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Handle US phone numbers
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }

  // If it already starts with +, assume it's formatted correctly
  if (phone.startsWith("+")) {
    return phone;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Add API key validation
    if (!process.env.KLAVIYO_API_KEY) {
      console.error("KLAVIYO_API_KEY environment variable is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { email, phoneNumber, zip, pwsid } = await req.json();

    // Enhanced validation
    if (!email || !zip) {
      return NextResponse.json({ error: "Email and Zip Code are required" }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Build profile object carefully
    const profileAttributes: any = {
      email,
      location: { zip },
    };

    // Only add phone number if it's valid
    if (phoneNumber) {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (formattedPhone) {
        profileAttributes.phone_number = formattedPhone;
      } else {
        console.warn("Invalid phone number format, skipping:", phoneNumber);
      }
    }

    // Only add properties if pwsid exists
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

      // Extract only the serializable data from the response
      const profileData = {
        id: response.body?.data?.id,
        type: response.body?.data?.type,
        attributes: response.body?.data?.attributes,
      };

      return NextResponse.json({
        success: true,
        profile: profileData,
        message: "Profile created successfully",
      });
    } catch (profileError: any) {
      // Handle duplicate profile error specifically
      if (
        profileError.response?.status === 409 &&
        profileError.response?.data?.errors?.[0]?.code === "duplicate_profile"
      ) {
        const duplicateProfileId = profileError.response.data.errors[0].meta?.duplicate_profile_id;

        console.log("Profile already exists, attempting to update:", duplicateProfileId);

        // Try to update the existing profile instead
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

          // Even if update fails, we can still return success since the profile exists
          return NextResponse.json({
            success: true,
            profileId: duplicateProfileId,
            message: "Profile already exists",
          });
        }
      }

      // Re-throw other errors to be handled by the main catch block
      throw profileError;
    }
  } catch (error: any) {
    console.error("Error creating Klaviyo profile:", error);

    // Enhanced error logging
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

    // Return more specific error information
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
