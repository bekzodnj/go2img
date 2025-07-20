import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "~/db.server";
import { Polar } from "@polar-sh/sdk";
import { polar } from "@polar-sh/better-auth";

const client = new Polar({
  accessToken: process.env.POLAR_SANDBOX_ACCESS_TOKEN,
  server: "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      // Send an email to the user with a link to reset their password
    },
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    polar({
      client,
      // Enable automatic Polar Customer creation on signup
      createCustomerOnSignUp: true,
      // Enable customer portal
      enableCustomerPortal: true, // Deployed under /portal for authenticated users
      // Configure checkout
      checkout: {
        enabled: true,
        products: [
          {
            productId: "f151afd5-56df-4cf4-ac7f-c4b6b67f095f", // ID of Product from Polar Dashboard
            slug: "pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
          },
        ],
        successUrl: "/success?checkout_id={CHECKOUT_ID}",
      },
    }),
  ],
});
