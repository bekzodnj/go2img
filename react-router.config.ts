import type { Config } from "@react-router/dev/config";
export default {
  ssr: true,
  routeDiscovery: {
    mode: "initial",
  },
  // Dokploy's Traefik terminates TLS and forwards plain HTTP to the container,
  // and react-router-serve has no `trust proxy`, so request.url is built as
  // http://go2img.bekzod.net/... while the browser sends Origin:
  // https://go2img.bekzod.net. Without this the action CSRF guard rejects every
  // POST with 400. Keep in sync with `baseURL.allowedHosts` in app/lib/auth.ts.
  allowedActionOrigins: ["go2img.bekzod.net"],
} satisfies Config;
