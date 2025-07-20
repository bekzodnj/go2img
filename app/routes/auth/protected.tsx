import { auth } from "~/lib/auth";
import { Route } from "./+types/protected";
import { authClient } from "~/lib/auth-client";
import { redirect, useNavigate } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }
}

export default function Protected() {
  let navigate = useNavigate();
  return (
    <div>
      <h2>Protected page</h2>
      <button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                navigate("/signin");
              },
            },
          })
        }
      >
        Log out
      </button>
    </div>
  );
}
