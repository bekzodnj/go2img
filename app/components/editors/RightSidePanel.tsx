import { Divider, Space, TextInput } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { LabelStore } from "~/lib/editorLogic";
import { ColorPickerPanel } from "./ColorPickerPanel";
import { ImageScaleSlider } from "./ImageScaleSlider";
import { OutputCodeBlock } from "./OutputCodeBlock";
import { ImageUpload } from "../main/ImageUpload";
import { InlineImagePaste } from "./RightPanel/InlineImagePaste";

export function RightSidePanel() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );
  const selectedPolygon = polygons.find((p) => p.id === selectedPolygonId);

  return (
    <div>
      <h2>{selectedPolygonId ? "Label Settings" : "Background Settings"}</h2>
      <Space h="sm" />
      {selectedPolygonId !== null ? (
        <>
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
          <Space h="md" />
          <ColorPickerPanel />
          <Space h="xl" />
        </>
      ) : (
        <>
          <ImageUpload />
          <Space h="md" />
          <InlineImagePaste />
          <Divider my="md" />
          <Space h="sm" />
          <ImageScaleSlider />
          <Space h="md" />
          <Divider my="md" />
          <Space h="md" />
        </>
      )}

      <OutputCodeBlock />
      <Space h="lg" />
    </div>
  );
}
