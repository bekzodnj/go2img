import type { LoaderFunctionArgs } from "react-router";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router";

import { getNoteListItems } from "~/models/note.server";
import { requireUserIdWithRedirect } from "~/session.server";

import { authClient } from "~/lib/auth-client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserIdWithRedirect(request);
  // const userId = await requireUserId(request);

  const noteListItems = await getNoteListItems({ userId: user.id });
  return { user, noteListItems };
};

export default function Layout() {
  const data = useLoaderData<typeof loader>();
  let navigate = useNavigate();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">Udenote</Link>
        </h1>
        <p>
          {data.user.name} - {data.user.email}
        </p>

        <button
          className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  navigate("/login");
                },
              },
            })
          }
        >
          Log out
        </button>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <NavLink
            className={({ isActive }) =>
              `block border-b p-5 text-xl ${isActive ? "bg-white" : ""}`
            }
            to={"new"}
          >
            Create New Material
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `block border-b p-5 text-xl ${isActive ? "bg-white" : ""}`
            }
            to={"created"}
          >
            My Materials
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `block border-b p-5 text-xl ${isActive ? "bg-white" : ""}`
            }
            to={"saved"}
          >
            Saved Materials
          </NavLink>

          <hr />
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
