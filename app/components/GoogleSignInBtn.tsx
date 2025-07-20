import { Button } from "@mantine/core";
import { authClient } from "~/lib/auth-client";

export function GoogleSignInBtn() {
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
      callbackURL: "/dashboard",
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
    <Button variant="light" w={"100%"} radius={"xs"} onClick={googleSignIn}>
      Sign in with Google
    </Button>
  );
}
