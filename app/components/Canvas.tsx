import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Circle, Line, Group, Image } from "react-konva";
import {
  Button,
  TextInput,
  Paper,
  Group as MantineGroup,
  Stack,
  Text,
  Badge,
  Tooltip,
  Slider,
} from "@mantine/core";
import useImage from "use-image";
import { BackgroundImageStore, LabelStore } from "~/lib/editorLogic";
import { useSelector } from "@xstate/store/react";
import { type Polygon } from "~/lib/editorLogic";

type Point = { x: number; y: number };

const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 750;

const COLORS = [
  "#FF5E5B",
  "#00CECB",
  "#FFB400",
  "#9D4EDD",
  "#4CC9F0",
  "#6A994E",
  "#F15BB5",
  "#2EC4B6",
  "#F77F00",
  "#7209B7",
  "#3A86FF",
  "#70E000",
  "#FF006E",
  "#5A189A",
  "#3F88C5",
  "#16DB93",
  "#FDC500",
  "#9E2A2B",
  "#43AA8B",
  "#577590",
  "#FF8500",
  "#4895EF",
  "#B5179E",
  "#38B000",
  "#FF4D6D",
];

const PenToolPolygon = () => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [imageURL, setImageURL] = useState("");
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);

  const imageUrlFromStore = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageUrl,
  );

  const [bgImage, status] = useImage(
    imageUrlFromStore ||
      "https://images.unsplash.com/photo-1615873968403-89e068629265",
    "anonymous",
  );

  const imgScale = useSelector(LabelStore, (state) => state.context.imgScale);

  useEffect(() => {
    if (status === "loaded" && bgImage) {
      console.log("BG image loaded:", bgImage.width, bgImage.height);

      BackgroundImageStore.trigger.setOriginalSizeImage({
        originalImageWidth: bgImage.width,
        originalImageHeight: bgImage.height,
      });

      const maxWidth = STAGE_WIDTH * imgScale;
      const maxHeight = STAGE_HEIGHT * imgScale;
      const scale = parseFloat(
        Math.min(maxWidth / bgImage.width, maxHeight / bgImage.height).toFixed(
          2,
        ),
      );

      BackgroundImageStore.trigger.setSizeImage({
        imageWidth: Math.trunc(bgImage.width * scale),
        imageHeight: Math.trunc(bgImage.height * scale),
      });

      return () => {
        // LabelStore.trigger.reset();
      };
    }
  }, [bgImage, status, imageURL, imgScale]);

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

  const startNewPolygon = () => {
    setCurrentPoints([]);
    setIsDrawing(true);

    LabelStore.trigger.setSelectedPolygon({
      id: null,
    });
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

  const handleReset = () => {
    LabelStore.trigger.setPolygons({ polygons: [] });
    setCurrentPoints([]);
    setIsDrawing(false);

    LabelStore.trigger.setSelectedPolygon({
      id: null,
    });
    setMousePos(null);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setStageScale(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const deletePolygon = (polygonId: string) => {
    LabelStore.trigger.removeLabel({ id: polygonId });
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsDrawing(false);
        setCurrentPoints([]);
      }

      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key.toLowerCase() === "p"
      ) {
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
      }
    },
    [currentPoints, polygons, isDrawing, selectedPolygonId, setIsDrawing],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ padding: "16px", background: "#FAFAFA", minHeight: "100vh" }}>
      <Stack gap="md">
        {/* Top Toolbar */}
        <Paper
          shadow="xs"
          p="md"
          radius="md"
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
          }}
        >
          <Stack gap="sm">
            <TextInput
              value={imageURL}
              onChange={(e) => setImageURL(e.currentTarget.value)}
              placeholder="Paste image URL here..."
              size="sm"
              radius="md"
              styles={{
                input: {
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#F9FAFB",
                  fontSize: "14px",
                  "&:focus": {
                    borderColor: "#3B82F6",
                    backgroundColor: "white",
                  },
                },
              }}
            />

            <MantineGroup justify="space-between" align="center">
              <MantineGroup gap="xs">
                <Tooltip label="Start drawing (P)" position="bottom">
                  <Button
                    onClick={startNewPolygon}
                    disabled={isDrawing}
                    size="sm"
                    radius="md"
                    variant={isDrawing ? "light" : "filled"}
                    color={isDrawing ? "green" : "blue"}
                    styles={{
                      root: {
                        fontWeight: 500,
                        fontSize: "14px",
                      },
                    }}
                  >
                    {isDrawing ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#10B981",
                          }}
                        />
                        Drawing...
                      </span>
                    ) : (
                      "Start Polygon"
                    )}
                  </Button>
                </Tooltip>

                <Tooltip label="Undo last action (Ctrl+Z)" position="bottom">
                  <Button
                    onClick={handleUndo}
                    disabled={
                      currentPoints.length === 0 && polygons.length === 0
                    }
                    size="sm"
                    radius="md"
                    variant="subtle"
                    color="gray"
                    styles={{
                      root: {
                        fontWeight: 500,
                        fontSize: "14px",
                      },
                    }}
                  >
                    Undo
                  </Button>
                </Tooltip>
              </MantineGroup>

              <MantineGroup gap="md">
                <MantineGroup gap="xs" align="center">
                  <Text size="xs" c="dimmed" fw={500}>
                    Polygons:
                  </Text>
                  <Badge
                    size="lg"
                    radius="md"
                    variant="light"
                    color={polygons.length > 0 ? "blue" : "gray"}
                  >
                    {polygons.length}
                  </Badge>
                </MantineGroup>

                <MantineGroup gap="xs" align="center">
                  <Text size="xs" c="dimmed" fw={500}>
                    Canvas:
                  </Text>
                  <Badge size="lg" radius="md" variant="light" color="gray">
                    {bgImgWidth} × {bgImgHeight}
                  </Badge>
                </MantineGroup>

                <MantineGroup
                  gap="xs"
                  align="center"
                  style={{ width: "200px" }}
                >
                  <Text size="xs" c="dimmed" fw={500}>
                    Zoom:
                  </Text>
                  <Slider
                    value={stageScale}
                    onChange={setStageScale}
                    min={0.1}
                    max={5}
                    step={0.1}
                    style={{ flex: 1 }}
                    size="sm"
                  />
                  <Text size="xs" c="dimmed" fw={500}>
                    {Math.round(stageScale * 100)}%
                  </Text>
                </MantineGroup>
              </MantineGroup>
            </MantineGroup>
          </Stack>
        </Paper>

        {/* Canvas Area */}
        <Paper
          shadow="sm"
          radius="md"
          style={{
            width: "fit-content",
            overflow: "auto",
            background: "white",
            border: "1px solid #E5E7EB",
          }}
        >
          <Stage
            ref={stageRef}
            width={bgImgWidth}
            height={bgImgHeight}
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
            style={{
              background: "#F9FAFB",
              cursor: isDrawing ? "crosshair" : "grab",
            }}
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
                  scaleX={imgScale}
                  scaleY={imgScale}
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
                          isClosing
                            ? "#F59E0B"
                            : isFirst
                              ? "#EF4444"
                              : "#3B82F6"
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
        </Paper>
      </Stack>
    </div>
  );
};

export default PenToolPolygon;
