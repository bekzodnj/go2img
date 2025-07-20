import { Checkout } from "@polar-sh/remix";

export const loader = Checkout({
  accessToken: process.env.POLAR_SANDBOX_ACCESS_TOKEN as string,
  server: "sandbox",
  successUrl: "/success?checkout_id={CHECKOUT_ID}",
});
