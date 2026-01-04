import { Button } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { LabelStore } from "~/lib/editorLogic";

export function LabelNav() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);

  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );

  const selectedPolygon = polygons.find((p) => p.id === selectedPolygonId);

  return (
    <div>
      {polygons.length > 0 ? (
        <div
          style={{
            margin: "1rem 0",
            borderTop: "1px solid #ccc",
            overflowY: "auto",
            overflowX: "auto",
            maxHeight: "500px",
            paddingTop: "1rem",
          }}
        >
          <h4>Polygons:</h4>
          {polygons.map((polygon, index) => (
            <div
              key={polygon.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "5px",
                margin: "5px 0",
              }}
            >
              <Button
                size="compact-md"
                variant={
                  selectedPolygonId === polygon.id ? "outline" : "default"
                }
                onClick={() =>
                  LabelStore.trigger.setSelectedPolygon({
                    id: selectedPolygonId === polygon.id ? null : polygon.id,
                  })
                }
                className="grow border"
              >
                <span className="flex items-center gap-1">
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: polygon.color,
                      border: "1px solid black",
                    }}
                  ></span>
                  <span className="text-xs">
                    {polygon.name || "Polygon"} ({polygon.points.length} dots)
                  </span>
                </span>
              </Button>
              <Button
                size="compact-xs"
                variant="subtle"
                onClick={() =>
                  LabelStore.trigger.removeLabel({ id: polygon.id })
                }
                style={{ color: "red" }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
