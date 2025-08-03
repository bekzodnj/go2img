import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Circle, Line, Group } from "react-konva";
import Konva from "konva";
import { Button } from "@mantine/core";

type Point = { x: number; y: number };

const PenToolPolygon: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const polygonGroupRef = useRef<Konva.Group | null>(null);

  const getLinePoints = () =>
    (isClosed ? [...points, points[0]] : points).flatMap((p) => [p.x, p.y]);

  const handleStageClick = (e: any) => {
    if (!isDrawing || isClosed) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    console.log("points", points);
    console.log("pos", pos);

    // Check for closing
    if (points.length > 2) {
      const dx = points[0].x - pos.x;
      const dy = points[0].y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        setIsClosed(true);
        setIsDrawing(false);
        setMousePos(null);
        return;
      }
    }

    setPoints([...points, pos]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    setMousePos(pos);
  };

  // 👇 Group dragging to move polygon
  const handlePolygonDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const dx = node.x();
    const dy = node.y();

    const updatedPoints = points.map((p) => ({
      x: p.x + dx,
      y: p.y + dy,
    }));

    setPoints(updatedPoints);

    // reset position of group back to (0,0) after move
    node.position({ x: 0, y: 0 });
  };

  const handleUndo = () => {
    if (points.length === 0) return;
    setPoints(points.slice(0, -1));
    if (isClosed) {
      setIsClosed(false);
      setIsDrawing(true);
    }
  };

  const handleReset = () => {
    setPoints([]);
    setIsDrawing(true);
    setIsClosed(false);
    setMousePos(null);
  };

  const updatePoint = (index: number, pos: Point) => {
    const updated = [...points];
    updated[index] = pos;
    setPoints(updated);
  };

  // 🔁 Ctrl+Z / Cmd+Z support
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }
    },
    [points, isClosed],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div>
      <Button color="blue">Hey</Button>
      {/* 🧼 Clean Toolbar */}
      <div style={{ margin: "1rem 0", display: "flex", gap: "1rem" }}>
        <button onClick={handleUndo} disabled={points.length === 0}>
          Undo (Ctrl+Z)
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        style={{ background: "#f0f0f0", border: "1px solid red" }}
      >
        <Layer>
          {/* 🟦 Polygon + Drag logic */}
          <Group
            ref={polygonGroupRef}
            draggable={isClosed}
            onDragEnd={handlePolygonDrag}
          >
            <Line
              points={getLinePoints()}
              closed={isClosed}
              stroke="blue"
              strokeWidth={2}
              fill={isClosed ? "rgba(0,0,255,0.1)" : ""}
            />
          </Group>

          {/* 🔘 Points — editable after closing */}
          {points.map((p, i) => {
            const isFirst = i === 0;
            const isClosing =
              isFirst &&
              isDrawing &&
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
                    ? "orange"
                    : isFirst
                      ? "red"
                      : isClosed
                        ? "#4caf50"
                        : "black"
                }
                draggable={isClosed}
                onDragMove={(e) => {
                  if (!isClosed) return;
                  const { x, y } = e.target.position();
                  updatePoint(i, { x, y });
                }}
              />
            );
          })}

          {/* 🔄 Preview line from last point to cursor */}
          {!isClosed && isDrawing && mousePos && points.length > 0 && (
            <Line
              points={[
                points[points.length - 1].x,
                points[points.length - 1].y,
                mousePos.x,
                mousePos.y,
              ]}
              stroke="gray"
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}

          {/* 👆 Ghost cursor point */}
          {isDrawing && mousePos && (
            <Circle
              x={mousePos.x}
              y={mousePos.y}
              radius={4}
              fill="gray"
              opacity={0.4}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default PenToolPolygon;
