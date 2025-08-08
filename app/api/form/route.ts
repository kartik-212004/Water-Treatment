import { NextResponse, NextRequest } from "next/server";

import { ApiKeySession, ProfileCreateQuery, ProfileEnum, ProfilesApi } from "klaviyo-api";

const session = new ApiKeySession(process.env.KLAVIYO_API_KEY || "");
const profilesApi = new ProfilesApi(session);

export async function POST(req: NextRequest) {
  try {
    const { email, phoneNumber, zip, pwsid } = await req.json();

    if (!email || !zip) {
      return NextResponse.json({ error: "Email and Zip Code are required" }, { status: 400 });
    }

    const profile: ProfileCreateQuery = {
      data: {
        type: ProfileEnum.Profile,
        attributes: {
          email,
          phoneNumber,
          location: { zip },
          properties: { pwsid },
        },
      },
    };

    const response = await profilesApi.createProfile(profile);

    return NextResponse.json({
      success: true,
      klaviyoResponse: response,
    });
  } catch (error: any) {
    console.error("Error creating Klaviyo profile:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
