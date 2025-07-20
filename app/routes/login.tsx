import { useEffect, useRef } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import {
  data,
  Form,
  Link,
  redirect,
  useNavigate,
  useSearchParams,
} from "react-router";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import tiles from "../static/brain-bg.png";

import type { Route } from "./+types/login";
import { auth } from "~/lib/auth";
import { useSession } from "~/lib/auth-client";
import { GoogleSignInBtn } from "~/components/GoogleSignInBtn";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    return redirect("/dashboard");
  }

  console.log("Session", session);

  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return data(
      { errors: { email: "Email is invalid", password: null }, message: "" },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return data(
      {
        errors: { email: null, password: "Password is required" },
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return data(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse: true, // returns a response object instead of data
  });

  return response;
};

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/notes";
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    if (session.data) {
      navigate("/protected");
    }
  }, [session]);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  if (session.isPending) {
    return (
      <div className="flex min-h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-md px-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-full flex-col justify-center bg-[auto_300px] bg-right-top bg-no-repeat"
      style={{ backgroundImage: `url(${tiles})` }}
    >
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              ) : null}

              {/* @ts-ignore */}
              {actionData?.message ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {/* @ts-ignore */}
                  {actionData?.message}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>

        <div className="mt-6 flex items-center justify-center">
          <div className="h-0.5 w-full bg-gray-300" />
          <div className="absolute rounded-full bg-white px-2 text-sm text-gray-500">
            Or continue with
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center">
          <GoogleSignInBtn />
        </div>
      </div>
    </div>
  );
}
