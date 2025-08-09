import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Circle, Line, Group } from "react-konva";
import Konva from "konva";

type Point = { x: number; y: number };
type Polygon = {
  id: string;
  points: Point[];
  isClosed: boolean;
  color: string;
};

const PenToolPolygon: React.FC = () => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(
    null,
  );
  const [mousePos, setMousePos] = useState<Point | null>(null);

  const colors = ["blue", "red", "green", "purple", "orange", "cyan"];

  const startNewPolygon = () => {
    setCurrentPoints([]);
    setIsDrawing(true);
    setSelectedPolygonId(null);
  };

  const getLinePoints = (points: Point[], isClosed: boolean) =>
    (isClosed ? [...points, points[0]] : points).flatMap((p) => [p.x, p.y]);

  const handleStageClick = (e: any) => {
    if (!isDrawing) return;
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
          color: colors[polygons.length % colors.length],
        };
        setPolygons([...polygons, newPolygon]);
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
  const handlePolygonDrag =
    (polygonId: string) => (e: Konva.KonvaEventObject<DragEvent>) => {
      // Ignore bubbled dragend coming from child nodes (anchors)
      if (e.target !== e.currentTarget) return;

      const node = e.target;
      const dx = node.x();
      const dy = node.y();

      setPolygons((prev) =>
        prev.map((polygon) => {
          if (polygon.id === polygonId) {
            const updatedPoints = polygon.points.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            }));
            return { ...polygon, points: updatedPoints };
          }
          return polygon;
        }),
      );

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
    setPolygons((prev) =>
      prev.map((polygon) => {
        if (polygon.id === polygonId) {
          const updated = [...polygon.points];
          updated[pointIndex] = newPos;
          return { ...polygon, points: updated };
        }
        return polygon;
      }),
    );
  };

  const handleUndo = () => {
    if (isDrawing && currentPoints.length > 0) {
      setCurrentPoints(currentPoints.slice(0, -1));
    } else if (polygons.length > 0) {
      setPolygons(polygons.slice(0, -1));
    }
  };

  const handleReset = () => {
    setPolygons([]);
    setCurrentPoints([]);
    setIsDrawing(false);
    setSelectedPolygonId(null);
    setMousePos(null);
  };

  const deletePolygon = (polygonId: string) => {
    setPolygons((prev) => prev.filter((p) => p.id !== polygonId));
    if (selectedPolygonId === polygonId) {
      setSelectedPolygonId(null);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }
    },
    [currentPoints, polygons, isDrawing],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div>
      <div
        style={{
          margin: "1rem 0",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button onClick={startNewPolygon} disabled={isDrawing}>
          Start New Polygon
        </button>
        <button
          onClick={handleUndo}
          disabled={currentPoints.length === 0 && polygons.length === 0}
        >
          Undo (Ctrl+Z)
        </button>
        <button onClick={handleReset}>Reset All</button>
        <span>Polygons: {polygons.length}</span>
        {isDrawing && (
          <span style={{ color: "green" }}>Drawing mode active</span>
        )}
      </div>

      {/* Polygon list */}
      {polygons.length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          <h4>Polygons:</h4>
          {polygons.map((polygon, index) => (
            <div
              key={polygon.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "5px 0",
                padding: "5px",
                backgroundColor:
                  selectedPolygonId === polygon.id ? "#e0e0e0" : "transparent",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: polygon.color,
                  border: "1px solid black",
                }}
              ></div>
              <span>
                Polygon {index + 1} ({polygon.points.length} points)
              </span>
              <button
                onClick={() =>
                  setSelectedPolygonId(
                    selectedPolygonId === polygon.id ? null : polygon.id,
                  )
                }
                style={{ fontSize: "12px" }}
              >
                {selectedPolygonId === polygon.id ? "Deselect" : "Select"}
              </button>
              <button
                onClick={() => deletePolygon(polygon.id)}
                style={{ fontSize: "12px", color: "red" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <Stage
        width={800}
        height={600}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        style={{ background: "#f0f0f0", border: "1px solid lightgray" }}
      >
        <Layer>
          {/* Render completed polygons */}
          {polygons.map((polygon) => (
            <Group
              key={polygon.id}
              draggable={true}
              onDragEnd={handlePolygonDrag(polygon.id)}
              opacity={selectedPolygonId === polygon.id ? 1 : 0.7}
            >
              {/* Polygon line */}
              <Line
                points={getLinePoints(polygon.points, polygon.isClosed)}
                closed={polygon.isClosed}
                stroke={polygon.color}
                strokeWidth={selectedPolygonId === polygon.id ? 3 : 2}
                fill={polygon.isClosed ? `${polygon.color}40` : ""}
              />

              {/* FIXED: Anchor points are now inside the Group */}
              {selectedPolygonId === polygon.id &&
                polygon.points.map((p, i) => (
                  <Circle
                    key={i}
                    x={p.x}
                    y={p.y}
                    radius={6}
                    fill={i === 0 ? "red" : "#4caf50"}
                    stroke="white"
                    strokeWidth={1}
                    draggable={true}
                    onDragMove={(e) => {
                      const { x, y } = e.target.position();
                      updatePolygonPoint(polygon.id, i, { x, y });

                      e.evt.stopPropagation();
                    }}
                  />
                ))}
            </Group>
          ))}

          {/* Current drawing polygon */}
          {isDrawing && (
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
          )}

          {/* Preview line from last point to cursor */}
          {isDrawing && mousePos && currentPoints.length > 0 && (
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
          )}

          {/* Ghost cursor point */}
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
