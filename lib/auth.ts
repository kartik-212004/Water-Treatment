import { betterAuth, LiteralUnion, Models } from "better-auth";

export const auth = betterAuth({
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
      disableIpTracking: false,
    },
    useSecureCookies: true,
    disableCSRFCheck: false,
    crossSubDomainCookies: {
      enabled: true,
      additionalCookies: ["custom_cookie"],
      domain: "example.com",
    },
    cookies: {
      session_token: {
        name: "custom_session_token",
        attributes: {
          httpOnly: true,
          secure: true,
        },
      },
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
    },
    cookiePrefix: "myapp",
    database: {
      // If your DB is using auto-incrementing IDs, set this to true.
      useNumberId: false,
      generateId: (options: { model: LiteralUnion<Models, string>; size?: number }) => {
        return "my-super-unique-id";
      },
      defaultFindManyLimit: 1,
    },
  },
});
