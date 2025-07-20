import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Nav Bar */}
      <nav className="fixed top-0 z-10 w-full border-b border-gray-400 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <h1
              className="text-4xl font-light tracking-wider text-gray-900"
              suppressHydrationWarning
            >
              Udenote
            </h1>
            <div className="flex space-x-10">
              <Link
                to="/dashboard"
                className="text-xl font-light text-gray-600 transition duration-300 hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                to="/materials"
                className="text-xl font-light text-gray-600 transition duration-300 hover:text-gray-900"
              >
                Search materials
              </Link>
              <Link
                to="/create"
                className="text-xl font-light text-gray-600 transition duration-300 hover:text-gray-900"
              >
                Create
              </Link>
              <a
                href="/login"
                className="text-xl font-light text-gray-600 transition duration-300 hover:text-gray-900"
              >
                Sign In
              </a>
              <a
                href="#contact"
                className="text-xl font-light text-gray-600 transition duration-300 hover:text-gray-900"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="flex basis-10 items-center justify-center border-b border-gray-400 px-40 py-52"
        style={{ backgroundColor: "rgb(247, 247, 247)" }}
      >
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-6 text-5xl font-light tracking-tight text-gray-900">
            Marketplace for Notion pages
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            A place to read, write, and share your knowledge
          </p>
          <a
            href="#contact"
            className="inline-block rounded-md bg-[#303335] px-8 py-3 text-white transition duration-300 hover:bg-[#242628]"
            style={{ borderRadius: "6px" }}
          >
            Get Started
          </a>
        </div>
      </section>

      <section
        id="about"
        className="border-b border-gray-400 py-20"
        style={{ backgroundColor: "#f0f8ff" }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="mb-6 text-3xl font-light text-gray-900">About Us</h3>
          <p className="text-lg leading-relaxed text-gray-600">
            We believe in the power of minimalism. Our mission is to create
            experiences that are intuitive, beautiful, and timeless. Every
            element is carefully crafted to ensure clarity and purpose, leaving
            a lasting impression.
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-center text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex justify-center space-x-8">
            <a
              href="/"
              className="text-sm text-gray-400 transition duration-300 hover:text-white"
            >
              About Us
            </a>
            <a
              href="#privacy"
              className="text-sm text-gray-400 transition duration-300 hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-sm text-gray-400 transition duration-300 hover:text-white"
            >
              Terms of Service
            </a>
          </div>
          <p className="text-5xl font-light tracking-wider text-white/10">
            Udenote
          </p>
          <p className="mt-4 text-sm text-gray-400">© 2025 Udenote.</p>
        </div>
      </footer>
    </div>
  );
}
