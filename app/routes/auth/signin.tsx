import {
  Box,
  Button,
  Flex,
  Group,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { Form, redirect } from "react-router";

import { authClient } from "~/lib/auth-client";
import { Route } from "./+types/signin";
import { auth } from "~/lib/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    return redirect("/dashboard");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("email", email, password);

  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse: true, // returns a response object instead of data
  });

  console.log("Response", response);

  return response;
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const googleSignIn = async () => {
    await authClient.signIn.social({
      /**
       * The social provider id
       * @example "github", "google", "apple"
       */
      provider: "google",
      /**
       * a url to redirect after the user authenticates with the provider
       * @default "/"
       */
      callbackURL: "/protected",
      /**
       * a url to redirect if an error occurs during the sign in process
       */
      errorCallbackURL: "/error",
      /**
       * a url to redirect if the user is newly registered
       */
      //   newUserCallbackURL: "/welcome",
      /**
       * disable the automatic redirect to the provider.
       * @default false
       */
      //   disableRedirect: true,
    });
  };

  return (
    <div>
      <h2>Sign In to account</h2>

      <Form method="post">
        <TextInput
          label="Email"
          name="email"
          placeholder="Enter your email"
          w={300}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />

        <PasswordInput
          name="password"
          value={password}
          placeholder="Enter your password"
          w={300}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />

        <Group gap={"xs"}>
          <Button type="submit" variant="filled">
            Button
          </Button>

          <Button variant="light" radius={"xs"} onClick={googleSignIn}>
            Sign in with Google
          </Button>
        </Group>
      </Form>
    </div>
  );
}
