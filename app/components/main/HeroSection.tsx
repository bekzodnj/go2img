import { useState } from "react";
import { Link } from "react-router";
import styles from "./HeroTitle.module.css";

// Hand-traced outline of the book (cover plus page edges) in the scene's
// 800×450 viewBox, a little uneven on purpose, like a real annotation
const bookOutline = [
  [333, 148],
  [400, 147],
  [468, 150],
  [476, 156],
  [477, 240],
  [476, 331],
  [400, 332],
  [334, 331],
  [332, 240],
];
const bookLabelAnchor = bookOutline[0];

// Decorative toolbar; shows the tool that would make the visible annotation
const tools = [
  { name: "Select", d: "M4 4l7 16 2.5-6.5L20 11z" },
  { name: "Pen", d: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" },
  { name: "Rectangle", d: "M4 5h16v14H4z" },
  { name: "Point", d: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
];

export function HeroSection() {
  const [bookActive, setBookActive] = useState(false);
  const activeTool = bookActive ? "Pen" : "Select";
  const fade = {
    opacity: bookActive ? 1 : 0,
    transition: "opacity 200ms ease-out",
  };

  return (
    <section className="px-6 pb-32 pt-24 sm:pt-36">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-indigo-500">
          Image annotation tool
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          Draw on your images.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gray-500">
          Annotate and map your images, one at a time or a whole batch. Then
          export everything to JSON.
        </p>

        <div className="mt-12 flex items-center justify-center gap-3">
          <Link
            to="/editor"
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            Open editor
          </Link>
          <Link
            to="/app"
            className="rounded-full bg-indigo-50 px-6 py-3 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-4xl sm:mt-32">
        <div
          className={`${styles.canvas} relative aspect-[16/10] overflow-hidden rounded-2xl border border-gray-200`}
          aria-hidden="true"
        >
          <div className="absolute left-4 top-4 hidden flex-col gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:flex">
            {tools.map((tool) => (
              <span
                key={tool.name}
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  tool.name === activeTool
                    ? "bg-indigo-500 text-white"
                    : "text-gray-400"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={tool.d} />
                </svg>
              </span>
            ))}
          </div>

          {/* Image, outline and tag share one 16:9 frame, so the tag's % position tracks the outline at any size */}
          <div className="absolute inset-x-4 top-1/2 aspect-[16/9] -translate-y-1/2 overflow-hidden rounded-lg shadow-sm sm:inset-x-16">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 800 450"
            >
              <DeskScene />

              {/* Hovering (or tapping) the book reveals its polygon annotation */}
              <g
                className="cursor-pointer"
                onMouseEnter={() => setBookActive(true)}
                onMouseLeave={() => setBookActive(false)}
                onClick={() => setBookActive((active) => !active)}
              >
                <polygon
                  style={fade}
                  points={bookOutline.join(" ")}
                  fill="#6366f1"
                  fillOpacity={0.12}
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
                {bookOutline.map(([x, y]) => (
                  <rect
                    key={`${x}-${y}`}
                    className="pointer-events-none"
                    style={fade}
                    x={x - 4}
                    y={y - 4}
                    width={8}
                    height={8}
                    rx={2}
                    fill="#fff"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                ))}
              </g>
            </svg>

            <div
              className="pointer-events-none absolute -translate-y-full pb-1.5"
              style={{
                left: `${(bookLabelAnchor[0] / 800) * 100}%`,
                top: `${(bookLabelAnchor[1] / 450) * 100}%`,
                ...fade,
              }}
            >
              <span className="block rounded bg-indigo-500 px-2 py-0.5 text-xs font-medium text-white">
                Book
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-gray-400">
          Hover over the book
        </p>
      </div>
    </section>
  );
}

// Flat sample photo: a book standing on a desk
function DeskScene() {
  return (
    <g>
      <rect width="800" height="450" fill="#f4efe6" />
      <rect y="330" width="800" height="120" fill="#e3d3bc" />
      <rect y="330" width="800" height="8" fill="#d4c0a1" />

      <ellipse cx="405" cy="334" rx="92" ry="6" fill="#000" opacity="0.06" />
      {/* Page edges peeking out on the right */}
      <rect x="344" y="156" width="130" height="174" rx="3" fill="#efe5cf" />
      {/* Cover and spine */}
      <rect x="335" y="150" width="132" height="180" rx="4" fill="#3b6ea5" />
      <rect x="335" y="150" width="16" height="180" rx="4" fill="#2f5a88" />
      {/* Title */}
      <rect
        x="370"
        y="190"
        width="72"
        height="9"
        rx="2"
        fill="#fff"
        opacity="0.8"
      />
      <rect
        x="370"
        y="207"
        width="46"
        height="6"
        rx="2"
        fill="#fff"
        opacity="0.5"
      />
    </g>
  );
}
