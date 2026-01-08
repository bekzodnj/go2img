import { Button, Container, Text, Group } from "@mantine/core";
import { useNavigate } from "react-router";
import { useState } from "react";

export function HeroSection() {
  const navigate = useNavigate();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const points = [
    { x: 30, y: 30, color: "blue" },
    { x: 70, y: 30, color: "cyan" },
    { x: 85, y: 60, color: "blue" },
    { x: 50, y: 85, color: "cyan" },
    { x: 15, y: 60, color: "blue" },
  ];

  const pointConnections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
      <Container size={1200} py={120}>
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          {/* Left: Copy (keeping your excellent typography) */}
          <div className="z-1 relative">
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Create{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  interactive labels
                </span>
                <span className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400/50" />
              </span>{" "}
              in seconds
            </h1>

            <Text mt="lg" size="lg" className="max-w-lg text-gray-600">
              Pin, annotate, and export clean JSON — perfect for any project. No
              coding required.
            </Text>

            <Group mt="xl" className="gap-4">
              <Button
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                onClick={() => navigate("/editor")}
                className="shadow-lg shadow-blue-500/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Open Editor
                </div>
              </Button>

              <Button
                size="lg"
                variant="light"
                color="gray"
                role="link"
                onClick={() => navigate("/app")}
                className="transition-colors duration-300 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  View Dashboard
                </div>
              </Button>
            </Group>

            {/* Feature badges */}
            <div className="mt-10 flex flex-wrap gap-3">
              {[
                "Export to JSON",
                "Image Uploads",
                "Interactive editor",
                "Save into account",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-sm"
                >
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Super simple polygon on grid */}
          <div className="relative hidden md:block">
            <div className="relative aspect-[4/3] rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
              {/* Simple grid background */}
              <div className="absolute inset-4">
                <svg
                  className="h-full w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="simpleGrid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#simpleGrid)" />
                </svg>
              </div>

              {/* Main polygon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-64 w-64"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                >
                  {/* Polygon connecting lines */}
                  {pointConnections.map(([start, end], index) => (
                    <line
                      key={index}
                      x1={points[start].x}
                      y1={points[start].y}
                      x2={points[end].x}
                      y2={points[end].y}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                  ))}

                  {/* Interactive points */}
                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r={hoveredPoint === index ? 5 : 3}
                      fill={
                        hoveredPoint === index
                          ? "#ef4444"
                          : point.color === "blue"
                            ? "#3b82f6"
                            : "#06b6d4"
                      }
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredPoint(index)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </svg>
              </div>

              {/* Simple label (only shows on hover) */}
              {hoveredPoint !== null && (
                <div
                  className="absolute rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  style={{
                    left: `${points[hoveredPoint].x * 0.8}%`,
                    top: `${points[hoveredPoint].y * 0.8}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <span className="text-sm font-medium text-gray-700">
                    Point {String.fromCharCode(65 + hoveredPoint)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
