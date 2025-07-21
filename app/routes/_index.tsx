import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useActionData } from "react-router";
import { HeroSection } from "~/components/main/HeroSection";
import satori from "satori";
import { readFileSync } from "fs";
import { html } from "satori-html";
import React from "react";
import { Route } from "./+types/_index";
import { Button } from "@mantine/core";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const myText = formData.get("title") || "OG Image2!";

  const fontFilePath = `${process.cwd()}/app/static/InterDisplay-Regular.ttf`;
  const fontFile = readFileSync(fontFilePath);

  const markup = (
    <div
      style={{
        display: "flex",
        background: "skyblue",
        padding: "10px 20px",
        color: "white",
      }}
      className="bg-slate-400"
    >
      <h2>Hey</h2>
    </div>
  );

  const svg = await satori(markup as unknown as React.ReactNode, {
    width: 800,
    fonts: [
      {
        name: "Inter",
        data: fontFile,
      },
    ],
  });

  //console.log("It works", svg);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}
export default function Index({ actionData }: Route.ComponentProps) {
  console.log("ActionData:", actionData);
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

      <HeroSection />
      <Form method="post">
        <input type="text" name="title" />
        {/* <button type="submit">Submit</button> */}
        <Button
          type="submit"
          size="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
        >
          Generate Image!
        </Button>
      </Form>
      <div className="flex justify-center border">
        <div dangerouslySetInnerHTML={{ __html: actionData }} />
      </div>
    </div>
  );
}
