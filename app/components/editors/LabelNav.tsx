import { ActionIcon, ScrollArea, Text, UnstyledButton } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { LabelStore } from "~/lib/editorLogic";
import { Icon, icons } from "./icons";
import { SectionTitle } from "./SectionTitle";

export function LabelNav() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);

  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        padding: 12,
      }}
    >
      <SectionTitle count={polygons.length}>Polygons</SectionTitle>

      {polygons.length > 0 ? (
        <ScrollArea style={{ flex: 1, minHeight: 0 }} type="auto">
          {polygons.map((polygon) => {
            const isSelected = selectedPolygonId === polygon.id;
            return (
              <div
                key={polygon.id}
                className={`group ${isSelected ? "" : "hover:bg-gray-100"}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 6,
                  background: isSelected
                    ? "var(--mantine-color-blue-light)"
                    : undefined,
                }}
              >
                <UnstyledButton
                  onClick={() =>
                    LabelStore.trigger.setSelectedPolygon({
                      id: isSelected ? null : polygon.id,
                    })
                  }
                  aria-pressed={isSelected}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: polygon.color,
                    }}
                  />
                  <Text
                    size="sm"
                    truncate
                    c={isSelected ? "blue.7" : undefined}
                    fw={isSelected ? 500 : 400}
                  >
                    {polygon.name || "Polygon"}
                  </Text>
                </UnstyledButton>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  mr={4}
                  aria-label={`Delete ${polygon.name || "polygon"}`}
                  onClick={() =>
                    LabelStore.trigger.removeLabel({ id: polygon.id })
                  }
                  className={`transition-opacity focus:opacity-100 group-hover:opacity-100 ${
                    isSelected ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Icon d={icons.trash} size={14} />
                </ActionIcon>
              </div>
            );
          })}
        </ScrollArea>
      ) : (
        <Text size="sm" c="dimmed" ta="center" py="md">
          No polygons yet. Pick the pen tool (P) and click around a shape to
          draw one.
        </Text>
      )}
    </div>
  );
}
