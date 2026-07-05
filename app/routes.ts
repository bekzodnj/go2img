import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("editor/:projectId?", "routes/editor/Editor.tsx"),

  // new sign-in
  layout("routes/authlayout.tsx", [
    route("login", "routes/login.tsx"),
    route("join", "routes/join.tsx"),
  ]),

  // dash
  route("app", "routes/app/layout.tsx", [index("./routes/app/home.tsx")]),

  route("healthcheck", "routes/healthcheck.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("success", "routes/success.tsx"),

  // API routes
  route("api/auth/*", "routes/api/auth.tsx"),
  route("api/checkout/*", "api/checkout.tsx"),
  route("api/upload/image", "routes/api/upload/image.tsx"),
  route("api/project", "routes/api/project.tsx"),
] satisfies RouteConfig;
