import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useActionData } from "react-router";
import { HeroSection } from "~/components/main/HeroSection";

import React, { lazy, useState } from "react";
import { Route } from "./+types/_index";
import { Box, Button, Container, Flex } from "@mantine/core";

const Canvas = lazy(() => import("../components/Canvas"));
const ImageMap = lazy(() => import("../components/ImageMap"));

import ClientOnly from "~/components/ClientOnly";
import { Polygon } from "~/lib/editorLogic";

export const meta: MetaFunction = () => [{ title: "Go2Img" }];

export default function Index({ actionData }: Route.ComponentProps) {
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Nav Bar */}
      <nav className="fixed top-0 z-10 w-full border-b border-gray-200 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <h1
              className="select-none text-3xl font-semibold tracking-tight text-gray-900"
              suppressHydrationWarning
            >
              Go2Img
            </h1>

            {/* Navigation Links */}
            <div className="flex items-center space-x-10">
              <Link
                to="/app"
                className="relative text-lg font-medium text-gray-600 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-gray-900 after:transition-all after:duration-300 hover:text-gray-900 hover:after:w-full"
              >
                Dashboard
              </Link>
              <Link
                to="/editor"
                className="relative pl-4 text-lg font-semibold text-gray-900 before:absolute before:left-0 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-r before:from-indigo-500 before:to-pink-500 after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-indigo-500 after:to-pink-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                Editor
              </Link>

              <a
                href="/login"
                className="relative text-lg font-medium text-gray-600 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-gray-900 after:transition-all after:duration-300 hover:text-gray-900 hover:after:w-full"
              >
                Sign In
              </a>
              <a
                href="#contact"
                className="relative text-lg font-medium text-gray-600 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-gray-900 after:transition-all after:duration-300 hover:text-gray-900 hover:after:w-full"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      <Container strategy="grid" size={800} className="border">
        <div>
          <HeroSection />
        </div>
      </Container>

      {/* <div>
        <Flex px={"xl"} direction="column" align={"center"}>
          <div className="w-[1100px]">
            <ClientOnly>
              <Canvas setPolygonsCopy={setPolygons} />
            </ClientOnly>
          </div>

          <div className="w-[1100px]">
            <ClientOnly>
              <ImageMap polygonsCopy={polygons} />
            </ClientOnly>
          </div>
        </Flex>
      </div> */}
    </div>
  );
}
