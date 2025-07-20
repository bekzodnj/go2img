import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),

  // new sign-in
  route("join", "routes/join.tsx"),
  route("signin", "routes/auth/signin.tsx"),
  route("protected", "routes/auth/protected.tsx"),
  route("login", "routes/login.tsx"),

  route("notes", "routes/notes.tsx", [
    index("./routes/notes.home.tsx"),
    route("new", "routes/notes.new.tsx"),
    route(":noteId", "routes/notes.$noteId.tsx"),
    route("test", "routes/test.tsx"),
  ]),

  //dashboard
  route("dashboard", "routes/dashboard/layout.tsx", [
    index("./routes/dashboard/home.tsx"),
    route("new", "routes/dashboard/new.tsx"),
    route(":materialId", "routes/dashboard/$materialId.tsx", [
      route(":fileKey", "api/material.tsx"),
    ]),
    route("created", "routes/dashboard/created.tsx"),
    route("saved", "routes/dashboard/saved.tsx"),
  ]),

  route("healthcheck", "routes/healthcheck.tsx"),

  route("api/auth/*", "routes/api/auth.tsx"),
  route("api/checkout/*", "api/checkout.tsx"),
] satisfies RouteConfig;
