import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Circle, Line, Group, Image } from "react-konva";

import { Button, Flex, Space, Tooltip } from "@mantine/core";
import useImage from "use-image";
import { LabelStore } from "~/lib/editorLogic";
import { useSelector } from "@xstate/store/react";

type Point = { x: number; y: number };
export type Polygon = {
  id: string;
  points: Point[];
  isClosed: boolean;
  color: string;
};

const STAGE_WIDTH = 1300;
const STAGE_HEIGHT = 750;

const PenToolPolygon = ({
  setPolygonsCopy,
}: {
  setPolygonsCopy: React.Dispatch<React.SetStateAction<Polygon[]>>;
}) => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [bgImage, status] = useImage(
    "https://plus.unsplash.com/premium_photo-1670360414483-64e6d9ba9038?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740",
  );
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (status === "loaded" && bgImage) {
      const maxWidth = STAGE_WIDTH * 0.9;
      const maxHeight = STAGE_HEIGHT * 0.8;
      const scale = Math.min(
        maxWidth / bgImage.width,
        maxHeight / bgImage.height,
      );

      setImgSize({
        width: bgImage.width * scale,
        height: bgImage.height * scale,
      });

      return () => {
        LabelStore.trigger.reset();
      };
    }
  }, [bgImage, status]);

  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );

  const polygons = useSelector(LabelStore, (state) => state.context.polygons);

  const COLORS = [
    "#FF5E5B", // modern red
    "#00CECB", // aqua teal
    "#FFB400", // golden pop
    "#9D4EDD", // royal purple
    "#4CC9F0", // bright ice blue
    "#6A994E", // deep leaf green

    "#F15BB5", // hot pink (tasteful)
    "#2EC4B6", // turquoise teal
    "#F77F00", // vivid warm orange
    "#7209B7", // deep electric purple
    "#3A86FF", // vivid but stylish blue
    "#70E000", // fresh lime green

    "#FF006E", // vibrant magenta
    "#5A189A", // rich violet
    "#3F88C5", // saturated steel-blue
    "#16DB93", // mint-candy green
    "#FDC500", // strong yellow (modern)
    "#9E2A2B", // dark red wine

    "#43AA8B", // green with elegance
    "#577590", // muted ocean blue
    "#FF8500", // warm honey orange
    "#4895EF", // smooth electric blue
    "#B5179E", // raspberry violet
    "#38B000", // intense green
    "#FF4D6D", // coral-pink punch
  ];

  const startNewPolygon = () => {
    setCurrentPoints([]);
    setIsDrawing(true);

    LabelStore.trigger.setSelectedLabel({
      id: null,
    });
  };

  const getLinePoints = (points: Point[], isClosed: boolean) =>
    (isClosed ? [...points, points[0]] : points).flatMap((p) => [p.x, p.y]);

  const handleStageClick = (e: any) => {
    // if click happened directly on the stage, deselect
    if (e.target === e.target.getStage()) {
      LabelStore.trigger.setSelectedLabel({
        id: null,
      });
    }
    if (!isDrawing) return;

    /** Logic for drawing below */
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    // Check for closing
    if (currentPoints.length > 2) {
      const dx = currentPoints[0].x - pos.x;
      const dy = currentPoints[0].y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        // Close and save polygon
        const newPolygon: Polygon = {
          id: Date.now().toString(),
          points: currentPoints,
          isClosed: true,
          color: COLORS[polygons.length % COLORS.length],
        };

        LabelStore.trigger.setLabels({ polygons: [...polygons, newPolygon] });
        //setPolygons([...polygons, newPolygon]);
        setCurrentPoints([]);
        setIsDrawing(false);
        setMousePos(null);
        return;
      }
    }

    setCurrentPoints([...currentPoints, pos]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    setMousePos(pos);
  };

  // Fixed: Group dragging updates polygon in state
  const handlePolygonDrag = (e: any, polygonId: string) => {
    // Ignore bubbled dragend coming from child nodes (anchors)
    if (e.target !== e.currentTarget) return;

    const node = e.target;
    const dx = node.x();
    const dy = node.y();

    LabelStore.trigger.setLabels({
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

    // Reset group position
    node.position({ x: 0, y: 0 });
    // Extra safety: don't bubble further
    e.cancelBubble = true;
  };

  const updatePolygonPoint = (
    polygonId: string,
    pointIndex: number,
    newPos: Point,
  ) => {
    LabelStore.trigger.setLabels({
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
      // setPolygons(polygons.slice(0, -1));
      LabelStore.trigger.setLabels({ polygons: polygons.slice(0, -1) });
    }
  };

  const handleReset = () => {
    LabelStore.trigger.setLabels({ polygons: [] });
    setCurrentPoints([]);
    setIsDrawing(false);

    LabelStore.trigger.setSelectedLabel({
      id: null,
    });
    setMousePos(null);
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
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        const el = e.target;
        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement
        ) {
          return; // Let other global text inputs pass
        }

        e.preventDefault();
        if (selectedPolygonId) {
          deletePolygon(selectedPolygonId);

          LabelStore.trigger.setSelectedLabel({
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
    <div className="border">
      <div>
        <Button
          mb={"sm"}
          variant="outline"
          onClick={() => {
            setPolygonsCopy(polygons);
          }}
        >
          Render!
        </Button>
      </div>

      <Flex gap="sm" align={"baseline"}>
        <Tooltip label="Pen (press P)">
          <Button
            variant="filled"
            onClick={startNewPolygon}
            disabled={isDrawing}
          >
            Start Polygon
          </Button>
        </Tooltip>
        <Button
          variant="white"
          onClick={handleUndo}
          disabled={currentPoints.length === 0 && polygons.length === 0}
        >
          Undo (Ctrl+Z)
        </Button>
        {isDrawing ? (
          <span style={{ color: "green" }}>
            Drawing mode active (press Esc to finish)
          </span>
        ) : null}
        <span>Polygons: {polygons.length}</span>
      </Flex>

      <Stage
        width={imgSize.width}
        height={imgSize.height}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        style={{ background: "#f0f0f0", border: "1px solid lightgray" }}
      >
        <Layer>
          <Image
            image={bgImage}
            width={imgSize.width} // TODO: fix fixed width-height
            height={imgSize.height}
            listening={false} // ← prevents clicks from selecting the image
          />
          {/* Render completed polygons */}
          {polygons.map((polygon) => (
            <Group
              key={polygon.id}
              draggable={true}
              onDragEnd={(e) => handlePolygonDrag(e, polygon.id)}
              onClick={() => {
                // setSelectedPolygonId(polygon.id);
                LabelStore.trigger.setSelectedLabel({
                  id: selectedPolygonId === polygon.id ? null : polygon.id,
                });
              }}
            >
              {/* Polygon line */}
              <Line
                points={getLinePoints(polygon.points, polygon.isClosed)}
                closed={polygon.isClosed}
                stroke={polygon.color}
                opacity={selectedPolygonId === polygon.id ? 0.6 : 0.3}
                strokeWidth={selectedPolygonId === polygon.id ? 3 : 2}
                fill={polygon.isClosed ? `gray` : ""}
              />

              {/* FIXED: Anchor points are now inside the Group */}
              {selectedPolygonId === polygon.id
                ? polygon.points.map((p, i) => (
                    <Circle
                      key={i}
                      x={p.x}
                      y={p.y}
                      radius={6}
                      fill={i === 0 ? "red" : "#4caf50"}
                      opacity={0.8}
                      stroke="white"
                      strokeWidth={1}
                      draggable={true}
                      onDragMove={(e) => {
                        const { x, y } = e.target.position();
                        updatePolygonPoint(polygon.id, i, { x, y });

                        e.evt.stopPropagation();
                      }}
                    />
                  ))
                : null}
            </Group>
          ))}

          {/* Current drawing polygon */}
          {isDrawing ? (
            <Group>
              <Line
                points={getLinePoints(currentPoints, false)}
                stroke="blue"
                strokeWidth={2}
              />

              {/* Current drawing points */}
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
                    fill={isClosing ? "orange" : isFirst ? "red" : "black"}
                  />
                );
              })}
            </Group>
          ) : null}

          {/* Preview line from last point to cursor */}
          {isDrawing && mousePos && currentPoints.length > 0 ? (
            <Line
              points={[
                currentPoints[currentPoints.length - 1].x,
                currentPoints[currentPoints.length - 1].y,
                mousePos.x,
                mousePos.y,
              ]}
              stroke="gray"
              strokeWidth={1}
              dash={[4, 4]}
            />
          ) : null}

          {/* Ghost cursor point */}
          {isDrawing && mousePos ? (
            <Circle
              x={mousePos.x}
              y={mousePos.y}
              radius={4}
              fill="gray"
              opacity={0.4}
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
};

export default PenToolPolygon;
