import { Text } from "@mantine/core";
import { useSelector } from "@xstate/store/react";

import { LabelStore } from "~/lib/editorLogic";
export const COLORS = [
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
export function ColorPickerPanel() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const selectedId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );

  const selected = polygons.find((p) => p.id === selectedId);

  if (!selected) {
    return <div style={{ opacity: 0.5 }}>No polygon selected</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Text size="md">Select </Text>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 6,
        }}
      >
        {COLORS.map((color) => {
          const isActive = selected.color === color;

          return (
            <button
              key={color}
              onClick={() =>
                LabelStore.trigger.changeLabelColor({
                  id: selected.id,
                  color,
                })
              }
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: color,
                border: isActive ? "2px solid #000" : "1px solid #ccc",
                outline: "none",
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
