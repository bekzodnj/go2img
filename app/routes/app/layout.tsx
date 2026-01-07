import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="p-4 text-xl font-semibold">
          <Link to="/">Go2Img</Link>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            Projects
          </NavLink>

          <button
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
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
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
