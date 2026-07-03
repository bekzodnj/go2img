import { Checkout } from "@polar-sh/remix";

export const loader = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: "http://localhost:3000/success", // The URL the user will be redirected to after a successful checkout
  returnUrl: "http://localhost:3000/app", // An optional URL which renders a back-button in the Checkout
  server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
  theme: "dark", // Enforces the theme - System-preferred theme will be set if left omitted
});

//bd1bc624-564d-4cef-8f8e-290222c94e44
