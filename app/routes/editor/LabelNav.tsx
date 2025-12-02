import { Button } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { editorStore, LabelStore } from "~/lib/editorLogic";

export function LabelNav() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);

  console.log("LabelNav polygons:", polygons);

  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );

  return (
    <div>
      {/* <div>
        <button onClick={() => editorStore.trigger.inc()}>Inc</button>
        <button onClick={() => editorStore.trigger.add({ num: 10 })}></button>
      </div> */}
      Polygon list
      {polygons.length > 0 ? (
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
                // backgroundColor:
                //   selectedPolygonId === polygon.id
                //     ? "var(--mantine-color-gray-1)"
                //     : "transparent",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: polygon.color,
                  border: "1px solid black",
                }}
              ></div>
              <span className="text-xs">
                Polygon {index + 1} ({polygon.points.length} points)
              </span>
              <Button
                variant="light"
                size="compact-xs"
                onClick={() =>
                  LabelStore.trigger.setSelectedLabel({
                    id: selectedPolygonId === polygon.id ? null : polygon.id,
                  })
                }
              >
                {selectedPolygonId === polygon.id ? "Done" : "Edit"}
              </Button>
              <Button
                variant="subtle"
                size="compact-xs"
                // onClick={() => deletePolygon(polygon.id)}
                style={{ color: "red" }}
              >
                Delete todo
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
