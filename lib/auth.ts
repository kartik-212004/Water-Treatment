import { betterAuth } from "better-auth";

export const auth = betterAuth({
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: {
      "/": {
        window: 100,
        max: 1,
      },
    },
    storage: "memory",
    modelName: "rateLimit",
  },
});
