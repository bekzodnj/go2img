import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useActionData } from "react-router";
import { HeroSection } from "~/components/main/HeroSection";
import satori from "satori";
import { readFileSync } from "fs";
import { html } from "satori-html";
import React, { lazy, Suspense } from "react";
import { Route } from "./+types/_index";
import { Box, Button, Container } from "@mantine/core";
import ImageMap from "~/components/main/ImageMap/ImageMapDemo";
import { OnlineStatus } from "~/components/main/OnlineStatus.client";

const Canvas = lazy(() => import("../components/Canvas"));

import ClientOnly from "~/components/ClientOnly";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index({ actionData }: Route.ComponentProps) {
  console.log("ActionData:", actionData);
  return (
    <div className="min-h-screen bg-white pt-14">
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

      <Container strategy="grid" size={500}>
        <Box bg="var(--mantine-color-indigo-light)" h={50}>
          <HeroSection />

          <ClientOnly>
            <Canvas />
          </ClientOnly>
        </Box>
      </Container>
    </div>
  );
}
