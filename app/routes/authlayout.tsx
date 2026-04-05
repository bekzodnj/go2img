import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 sm:py-4">
          {/* Logo */}
          <h1
            className="select-none text-3xl font-semibold tracking-tight text-gray-900"
            suppressHydrationWarning
          >
            <Link to="/">Go2Img</Link>
          </h1>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
