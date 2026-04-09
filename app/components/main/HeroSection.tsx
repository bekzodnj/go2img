import { Button, Container, Text, Group } from "@mantine/core";
import { useNavigate } from "react-router";
import { useState } from "react";
import styles from "./HeroTitle.module.css";

export function HeroSection() {
  const navigate = useNavigate();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const points = [
    { x: 30, y: 25, color: "#06b6d4" },
    { x: 72, y: 22, color: "#3b82f6" },
    { x: 88, y: 58, color: "#06b6d4" },
    { x: 50, y: 82, color: "#3b82f6" },
    { x: 12, y: 58, color: "#06b6d4" },
  ];

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50/50">
      <Container size={1200} py={120}>
        <div className="grid grid-cols-1 gap-32 md:grid-cols-2">
          <div className="z-1 relative">
            <h1 className={styles.heroHeading}>
              <span className={styles.outlinedWord}>Label</span>
              <span className={styles.annotateWord}>annotate</span>{" "}
              <span className="relative">
                <span className={styles.imagesGradient}>
                  images
                </span>
                <span className={styles.imagesUnderline} />
              </span>{" "}
              easily
            </h1>

            <Text mt="lg" size="lg" className="max-w-lg text-gray-600">
              Pin, annotate images and export metadata as clean JSON. No coding
              required.
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

          </div>

          {/* Right: Animated polygon drawing demo */}
          <div className="relative hidden md:block">
            <div className="relative h-[400px] rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
              {/* Grid background */}
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

              {/* Animated polygon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-64 w-64"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                >
                  <style>{`
                    @keyframes draw {
                      0%   { stroke-dashoffset: 220; }
                      60%  { stroke-dashoffset: 0; }
                      100% { stroke-dashoffset: 0; }
                    }
                    @keyframes fillIn {
                      0%   { fill-opacity: 0; }
                      60%  { fill-opacity: 0; }
                      100% { fill-opacity: 0.1; }
                    }
                    @keyframes labelAppear {
                      0%, 65%  { opacity: 0; transform: translateY(4px); }
                      75%      { opacity: 1; transform: translateY(0); }
                      100%     { opacity: 1; transform: translateY(0); }
                    }
                    .hero-path {
                      stroke-dasharray: 220;
                      animation: draw 3s ease-in-out forwards, fillIn 3s ease-in-out forwards;
                    }
                  `}</style>

                  {/* The polygon outline + fill */}
                  <path
                    className="hero-path"
                    d="M 30 25 L 72 22 L 88 58 L 50 82 L 12 58 Z"
                    fill="#3b82f6"
                    fillOpacity="0"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />

                  {/* Interactive vertex points */}
                  {points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={hoveredPoint === i ? 6 : 3}
                      fill={hoveredPoint === i ? "#f59e0b" : point.color}
                      stroke={hoveredPoint === i ? "white" : "none"}
                      strokeWidth={hoveredPoint === i ? 1.5 : 0}
                      style={{
                        cursor: "pointer",
                        transition:
                          "r 0.2s ease, fill 0.2s ease, stroke-width 0.2s ease",
                      }}
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </svg>
              </div>

              {/* Floating label — appears after draw, stays */}
              {hoveredPoint !== null ? (
                <div
                  className="pointer-events-none absolute rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  style={{
                    left: `${points[hoveredPoint].x * 0.8 + 10}%`,
                    top: `${points[hoveredPoint].y * 0.75 + 8}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <span className="text-sm font-medium text-gray-700">
                    Point {String.fromCharCode(65 + hoveredPoint)}
                  </span>
                </div>
              ) : (
                <div
                  className="pointer-events-none absolute rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  style={{
                    left: "50%",
                    top: "24%",
                    transform: "translate(-50%, -100%)",
                    opacity: 0,
                    animation: "labelAppear 3s ease-out forwards",
                  }}
                >
                  <span className="text-sm font-medium text-gray-700">
                    Custom label{" "}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Feature badges — full width, centered */}
          <div className="mt-12 flex w-full flex-wrap justify-center gap-3">
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
      </Container>
    </section>
  );
}
