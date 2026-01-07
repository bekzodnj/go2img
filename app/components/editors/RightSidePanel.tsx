import { Divider, Space, TextInput } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { LabelStore } from "~/lib/editorLogic";
import { ColorPickerPanel } from "./ColorPickerPanel";
import { ImageScaleSlider } from "./ImageScaleSlider";
import { OutputCodeBlock } from "./OutputCodeBlock";

export function RightSidePanel() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );
  const selectedPolygon = polygons.find((p) => p.id === selectedPolygonId);

  return (
    <div>
      {selectedPolygonId !== null && selectedPolygon ? (
        <TextInput
          label="Label name"
          placeholder="Shape name"
          value={
            selectedPolygon?.name !== undefined ? selectedPolygon.name : ""
          }
          onChange={(event) => {
            event.preventDefault();
            if (!selectedPolygonId) return;
            LabelStore.trigger.changeLabelName({
              id: selectedPolygonId!,
              newName: event.currentTarget.value,
            });
          }}
        />
      ) : null}
      <ColorPickerPanel />
      <Space h="md" />
      <Divider my="sm" />
      <ImageScaleSlider />
      <Space h="md" />
      <Divider my="sm" />
      <OutputCodeBlock />
    </div>
  );
}
