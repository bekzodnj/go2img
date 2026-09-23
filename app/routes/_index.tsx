import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { HeroSection } from "~/components/main/HeroSection";

export const meta: MetaFunction = () => [{ title: "Go2Img" }];

const navLink = "text-sm text-gray-500 transition-colors hover:text-gray-900";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
        <Link
          to="/"
          className="select-none text-lg font-semibold tracking-tight text-gray-900"
        >
          Go2Img
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/editor" className={navLink}>
            Editor
          </Link>
          <Link to="/app" className={navLink}>
            Dashboard
          </Link>
          <a href="/login" className={navLink}>
            Sign in
          </a>
        </div>
      </nav>

      <HeroSection />
    </div>
  );
}
