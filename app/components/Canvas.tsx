import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Circle, Line, Group, Image } from "react-konva";
import {
  ActionIcon,
  Anchor,
  Group as MantineGroup,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import useImage from "use-image";
import { BackgroundImageStore, LabelStore } from "~/lib/editorLogic";
import { useSelector } from "@xstate/store/react";
import { type Polygon } from "~/lib/editorLogic";
import { COLORS } from "~/lib/constants";
import { ImageUpload } from "~/components/main/ImageUpload";

type Point = { x: number; y: number };

// Images are fitted into this fixed box, and polygon points are stored in the
// fitted image's pixels, so it must not follow the viewport or saved shapes drift
const IMAGE_FIT_WIDTH = 1000;
const IMAGE_FIT_HEIGHT = 750;
type Tool = "pan" | "pen";

// A living room with lots of clear shapes to outline (Unsplash, 1600px wide)
const SAMPLE_IMAGE_URL =
  "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1600&q=80&auto=format";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const clampZoom = (scale: number) =>
  Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));

// 24×24 stroke icons (lucide shapes)
const icons = {
  pan: "M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
  pen: "M15.7 21.3a1 1 0 0 1-1.4 0l-1.6-1.6a1 1 0 0 1 0-1.4l5.6-5.6a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4zM18 13l-1.4-6.9a1 1 0 0 0-.7-.8L3.2 2a1 1 0 0 0-1.2 1.2l3.4 12.7a1 1 0 0 0 .7.7L13 18M2.3 2.3l7.3 7.3M13 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  undo: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  minus: "M5 12h14",
  plus: "M5 12h14M12 5v14",
  fit: "M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3",
};

// Tracks an element's size. A callback ref (with React 19 ref cleanup) rather
// than Mantine's useElementSize: its effect can re-run while StrictMode has the
// ref detached, and then it never observes the element at all
function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, ...size };
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const PenToolPolygon = ({ onFiles }: { onFiles: (files: File[]) => void }) => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>("pan"); // Default to Pan
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [imageURL, setImageURL] = useState("");
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);
  // The stage is a viewport onto the image and fills whatever space it gets
  const {
    ref: viewportRef,
    width: viewportWidth,
    height: viewportHeight,
  } = useViewportSize();

  const imageUrlFromStore = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageUrl,
  );

  // No crossOrigin here on purpose: the thumbnails load the same R2 urls with a
  // plain <img>, and requesting them again in cors mode either gets blocked
  // (bucket allowlist) or reuses the cached no-cors response and fails. Nothing
  // exports the stage to a bitmap, so a tainted canvas costs us nothing.
  const [bgImage, status] = useImage(imageUrlFromStore || "");
  // Fit the view once per image, not on every resize or scale change
  const fittedUrlRef = useRef<string | null>(null);

  const imgScale = useSelector(LabelStore, (state) => state.context.imgScale);

  useEffect(() => {
    if (status === "loaded" && bgImage) {
      BackgroundImageStore.trigger.setOriginalSizeImage({
        originalImageWidth: bgImage.width,
        originalImageHeight: bgImage.height,
      });

      const maxWidth = IMAGE_FIT_WIDTH * imgScale;
      const maxHeight = IMAGE_FIT_HEIGHT * imgScale;
      const scale = parseFloat(
        Math.min(maxWidth / bgImage.width, maxHeight / bgImage.height).toFixed(
          2,
        ),
      );

      const imageWidth = Math.trunc(bgImage.width * scale);
      const imageHeight = Math.trunc(bgImage.height * scale);
      BackgroundImageStore.trigger.setSizeImage({ imageWidth, imageHeight });

      if (viewportWidth > 0 && fittedUrlRef.current !== imageUrlFromStore) {
        fittedUrlRef.current = imageUrlFromStore;
        fitToView(imageWidth, imageHeight);
      }

      return () => {
        // LabelStore.trigger.reset();
      };
    }
  }, [bgImage, status, imageURL, imgScale, viewportWidth]);

  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );

  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const bgImgHeight = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageHeight,
  );
  const bgImgWidth = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageWidth,
  );

  // Helper to sync drawing state with tool selection
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    if (tool === "pan") {
      setIsDrawing(false);
      setCurrentPoints([]);
    } else {
      setIsDrawing(true);
    }
  };

  const getLinePoints = (points: Point[], isClosed: boolean) =>
    (isClosed ? [...points, points[0]] : points).flatMap((p) => [p.x, p.y]);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      LabelStore.trigger.setSelectedPolygon({
        id: null,
      });
    }
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Adjust for stage transformation
    const pos = {
      x: (pointerPos.x - stagePos.x) / stageScale,
      y: (pointerPos.y - stagePos.y) / stageScale,
    };

    if (currentPoints.length > 2) {
      const dx = currentPoints[0].x - pos.x;
      const dy = currentPoints[0].y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        const newPolygon: Polygon = {
          id: Date.now().toString(),
          points: currentPoints,
          isClosed: true,
          color: COLORS[polygons.length % COLORS.length],
          name: "Polygon " + (polygons.length + 1),
        };

        LabelStore.trigger.setPolygons({ polygons: [...polygons, newPolygon] });

        setCurrentPoints([]);
        setIsDrawing(false);
        setActiveTool("pan");
        setMousePos(null);
        LabelStore.trigger.setSelectedPolygon({
          id: newPolygon.id,
        });
        return;
      }
    }

    setCurrentPoints([...currentPoints, pos]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Adjust for stage transformation
    const pos = {
      x: (pointerPos.x - stagePos.x) / stageScale,
      y: (pointerPos.y - stagePos.y) / stageScale,
    };
    setMousePos(pos);
  };

  const handlePolygonDrag = (e: any, polygonId: string) => {
    if (e.target !== e.currentTarget) return;

    const node = e.target;
    const dx = node.x();
    const dy = node.y();

    LabelStore.trigger.setPolygons({
      polygons: polygons.map((polygon) => {
        if (polygon.id === polygonId) {
          const updatedPoints = polygon.points.map((p) => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
          return { ...polygon, points: updatedPoints };
        }
        return polygon;
      }),
    });

    node.position({ x: 0, y: 0 });
    e.cancelBubble = true;
  };

  const updatePolygonPoint = (
    polygonId: string,
    pointIndex: number,
    newPos: Point,
  ) => {
    LabelStore.trigger.setPolygons({
      polygons: polygons.map((polygon) => {
        if (polygon.id === polygonId) {
          const updated = [...polygon.points];
          updated[pointIndex] = newPos;
          return { ...polygon, points: updated };
        }
        return polygon;
      }),
    });
  };

  const handleUndo = () => {
    if (isDrawing && currentPoints.length > 0) {
      setCurrentPoints(currentPoints.slice(0, -1));
    } else if (polygons.length > 0) {
      LabelStore.trigger.setPolygons({ polygons: polygons.slice(0, -1) });
    }
  };

  // Zoom so the point under `anchor` (viewport px) stays put
  const zoomTo = (
    newScale: number,
    anchor = { x: viewportWidth / 2, y: viewportHeight / 2 },
  ) => {
    const scale = clampZoom(newScale);
    const pointTo = {
      x: (anchor.x - stagePos.x) / stageScale,
      y: (anchor.y - stagePos.y) / stageScale,
    };
    setStageScale(scale);
    setStagePos({
      x: anchor.x - pointTo.x * scale,
      y: anchor.y - pointTo.y * scale,
    });
  };

  // Show the whole image, centred, with a little breathing room
  function fitToView(width = bgImgWidth, height = bgImgHeight) {
    if (!width || !height || !viewportWidth || !viewportHeight) return;
    const scale = clampZoom(
      Math.min(viewportWidth / width, viewportHeight / height) * 0.92,
    );
    setStageScale(scale);
    setStagePos({
      x: (viewportWidth - width * scale) / 2,
      y: (viewportHeight - height * scale) / 2,
    });
  }

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const pointer = e.target.getStage().getPointerPosition();
    zoomTo(
      e.evt.deltaY < 0 ? stageScale * scaleBy : stageScale / scaleBy,
      pointer,
    );
  };

  const deletePolygon = (polygonId: string) => {
    LabelStore.trigger.removeLabel({ id: polygonId });
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsDrawing(false);
        setCurrentPoints([]);
        LabelStore.trigger.setSelectedPolygon({
          id: null,
        });
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "Del") {
        const el = e.target;
        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement
        ) {
          return;
        }

        e.preventDefault();
        if (selectedPolygonId) {
          deletePolygon(selectedPolygonId);

          LabelStore.trigger.setSelectedPolygon({
            id: null,
          });
        }
      }

      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsDrawing(true);
        handleToolChange("pen");
      }

      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        setIsDrawing(false);
        handleToolChange("pan");
      }
    },
    [currentPoints, polygons, isDrawing, selectedPolygonId, setIsDrawing],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
    >
      {/* Top Toolbar */}
      <MantineGroup
        justify="space-between"
        wrap="nowrap"
        px="md"
        py={8}
        style={{
          flexShrink: 0,
          background: "white",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <MantineGroup gap="xs" wrap="nowrap">
          <ActionIcon.Group>
            {(
              [
                { tool: "pan", label: "Pan (V)" },
                { tool: "pen", label: "Draw polygon (P)" },
              ] as const
            ).map(({ tool, label }) => (
              <Tooltip key={tool} label={label} position="bottom">
                <ActionIcon
                  size="lg"
                  variant={activeTool === tool ? "filled" : "default"}
                  onClick={() => handleToolChange(tool)}
                  aria-label={label}
                  aria-pressed={activeTool === tool}
                >
                  <Icon d={icons[tool]} />
                </ActionIcon>
              </Tooltip>
            ))}
          </ActionIcon.Group>

          <Tooltip label="Undo (⌘Z / Ctrl+Z)" position="bottom">
            <ActionIcon
              size="lg"
              variant="subtle"
              color="gray"
              onClick={handleUndo}
              disabled={currentPoints.length === 0 && polygons.length === 0}
              aria-label="Undo"
            >
              <Icon d={icons.undo} />
            </ActionIcon>
          </Tooltip>
        </MantineGroup>

        <MantineGroup gap={4} wrap="nowrap">
          <Tooltip label="Zoom out" position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => zoomTo(stageScale / 1.2)}
              aria-label="Zoom out"
            >
              <Icon d={icons.minus} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Reset to 100%" position="bottom">
            <UnstyledButton
              onClick={() => zoomTo(1)}
              w={48}
              ta="center"
              fz="xs"
              fw={500}
              c="dimmed"
            >
              {Math.round(stageScale * 100)}%
            </UnstyledButton>
          </Tooltip>
          <Tooltip label="Zoom in" position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => zoomTo(stageScale * 1.2)}
              aria-label="Zoom in"
            >
              <Icon d={icons.plus} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Fit image to view" position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => fitToView()}
              disabled={!imageUrlFromStore}
              aria-label="Fit image to view"
            >
              <Icon d={icons.fit} />
            </ActionIcon>
          </Tooltip>
        </MantineGroup>
      </MantineGroup>

      {/* Canvas Area */}
      <div
        ref={viewportRef}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          background: "var(--mantine-color-gray-1)",
        }}
      >
        <Stage
          ref={stageRef}
          width={viewportWidth}
          height={viewportHeight}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={!isDrawing}
          onWheel={handleWheel}
          onDragEnd={(e) => {
            setStagePos({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onClick={handleStageClick}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDrawing ? "crosshair" : "grab" }}
        >
          <Layer>
            <Image
              image={bgImage}
              width={bgImgWidth}
              height={bgImgHeight}
              listening={false}
            />

            {polygons.map((polygon) => (
              <Group
                key={polygon.id}
                draggable={true}
                onDragEnd={(e) => handlePolygonDrag(e, polygon.id)}
                onClick={() => {
                  LabelStore.trigger.setSelectedPolygon({
                    id: selectedPolygonId === polygon.id ? null : polygon.id,
                  });
                }}
              >
                <Line
                  points={getLinePoints(polygon.points, polygon.isClosed)}
                  closed={polygon.isClosed}
                  stroke={polygon.color}
                  opacity={selectedPolygonId === polygon.id ? 0.6 : 0.3}
                  strokeWidth={selectedPolygonId === polygon.id ? 3 : 2}
                  fill={polygon.isClosed ? `gray` : ""}
                />

                {selectedPolygonId === polygon.id
                  ? polygon.points.map((p, i) => (
                      <Circle
                        key={i}
                        x={p.x}
                        y={p.y}
                        radius={6}
                        fill={i === 0 ? "#EF4444" : "#3B82F6"}
                        opacity={0.9}
                        stroke="white"
                        strokeWidth={2}
                        draggable={true}
                        onMouseEnter={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) container.style.cursor = "move";
                        }}
                        onMouseLeave={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container)
                            container.style.cursor = isDrawing
                              ? "crosshair"
                              : "grab";
                        }}
                        onDragStart={(e) => {
                          e.cancelBubble = true;
                        }}
                        onDragMove={(e) => {
                          const { x, y } = e.target.position();
                          updatePolygonPoint(polygon.id, i, { x, y });

                          e.evt.stopPropagation();
                          e.cancelBubble = true;
                        }}
                        onDragEnd={(e) => {
                          e.cancelBubble = true;
                        }}
                      />
                    ))
                  : null}
              </Group>
            ))}

            {isDrawing ? (
              <Group>
                <Line
                  points={getLinePoints(currentPoints, false)}
                  stroke="#3B82F6"
                  strokeWidth={2}
                />

                {currentPoints.map((p, i) => {
                  const isFirst = i === 0;
                  const isClosing =
                    isFirst &&
                    mousePos &&
                    Math.hypot(p.x - mousePos.x, p.y - mousePos.y) < 10;

                  return (
                    <Circle
                      key={i}
                      x={p.x}
                      y={p.y}
                      radius={isClosing ? 10 : 6}
                      fill={
                        isClosing ? "#F59E0B" : isFirst ? "#EF4444" : "#3B82F6"
                      }
                      stroke="white"
                      strokeWidth={2}
                      opacity={0.9}
                    />
                  );
                })}
              </Group>
            ) : null}

            {isDrawing && mousePos && currentPoints.length > 0 ? (
              <Line
                points={[
                  currentPoints[currentPoints.length - 1].x,
                  currentPoints[currentPoints.length - 1].y,
                  mousePos.x,
                  mousePos.y,
                ]}
                stroke="#94A3B8"
                strokeWidth={1}
                dash={[5, 5]}
                opacity={0.6}
              />
            ) : null}

            {isDrawing && mousePos ? (
              <Circle
                x={mousePos.x}
                y={mousePos.y}
                radius={4}
                fill="#3B82F6"
                opacity={0.4}
              />
            ) : null}
          </Layer>
        </Stage>

        {!imageUrlFromStore ? (
          <div
            style={overlay({ inset: 0, display: "grid", placeItems: "center" })}
          >
            <div
              style={{
                width: "min(360px, 90%)",
                padding: 16,
                background: "white",
                borderRadius: 12,
                boxShadow: "var(--mantine-shadow-sm)",
                pointerEvents: "auto",
              }}
            >
              <ImageUpload onFiles={onFiles} multiple />
              <Text size="xs" c="dimmed" ta="center" mt="sm">
                Just want to try it?{" "}
                <Anchor
                  component="button"
                  size="xs"
                  onClick={() =>
                    BackgroundImageStore.trigger.setImageUrl({
                      imageUrl: SAMPLE_IMAGE_URL,
                    })
                  }
                >
                  Use a sample image
                </Anchor>
              </Text>
            </div>
          </div>
        ) : null}

        {status === "failed" ? (
          <Text
            size="xs"
            c="red.7"
            bg="red.0"
            px="sm"
            py={6}
            style={overlay({
              top: 12,
              left: "50%",
              translate: "-50% 0",
              borderRadius: 6,
            })}
          >
            Could not load this image. Check the URL and its CORS settings.
          </Text>
        ) : activeTool === "pen" ? (
          <Text
            size="xs"
            c="white"
            bg="dark.6"
            px="sm"
            py={6}
            style={overlay({
              top: 12,
              left: "50%",
              translate: "-50% 0",
              borderRadius: 6,
              whiteSpace: "nowrap",
            })}
          >
            Click to add points · click the first point to finish · Esc to
            cancel
          </Text>
        ) : null}

        {imageUrlFromStore && bgImgWidth > 0 ? (
          <Text size="xs" c="dimmed" style={overlay({ right: 12, bottom: 8 })}>
            {bgImgWidth} × {bgImgHeight} px
          </Text>
        ) : null}
      </div>
    </div>
  );
};

// Floating layer over the stage that lets clicks through to the canvas
function overlay(style: React.CSSProperties): React.CSSProperties {
  return { position: "absolute", pointerEvents: "none", ...style };
}

export default PenToolPolygon;
