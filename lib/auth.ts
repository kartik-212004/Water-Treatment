import { betterAuth } from "better-auth";

export const auth = betterAuth({
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: {
      "/api/form": {
        window: 60,
        max: 2,
      },
    },
    storage: "memory",
    modelName: "rateLimit",
  },
});
