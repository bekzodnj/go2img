import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { redirect, data, useNavigate } from "react-router";
import { Form, Link, useActionData, useSearchParams } from "react-router";
import { useEffect, useRef } from "react";

import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import { auth } from "~/lib/auth";
import { useSession } from "~/lib/auth-client";
import { GoogleSignInBtn } from "~/components/GoogleSignInBtn";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateEmail(email)) {
    return data(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return data(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return data(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  // const existingUser = await getUserByEmail(email);
  // if (existingUser) {
  //   return data(
  //     {
  //       errors: {
  //         email: "A user already exists with this email",
  //         password: null,
  //       },
  //     },
  //     { status: 400 },
  //   );
  // }

  const response = await auth.api.signUpEmail({
    body: {
      name: username,
      email,
      password,
    },
    asResponse: true, // returns a response object instead of data
  });

  console.log("Response", response);

  return response;

  // const user = await createUser(email, password);

  // return createUserSession({
  //   redirectTo,
  //   remember: false,
  //   request,
  //   userId: user.id,
  // });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const session = useSession();

  useEffect(() => {
    if (session.data) {
      navigate("/dashboard");
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
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                id="username"
                required
                placeholder="Display name"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="username"
                type="text"
                className="text-md w-full rounded border border-gray-500 px-2 py-1"
              />
            </div>
          </div>

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
                placeholder="@example.com"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="text-md w-full rounded border border-gray-500 px-2 py-1"
              />
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
                placeholder="min 8 characters"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="text-md w-full rounded border border-gray-500 px-2 py-1"
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
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </form>

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
