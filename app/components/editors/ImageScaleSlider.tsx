import { Slider } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { BackgroundImageStore, LabelStore } from "~/lib/editorLogic";

export function ImageScaleSlider() {
  const imgScale = useSelector(LabelStore, (state) => state.context.imgScale);

  const handleChange = (value: number) => {
    LabelStore.trigger.setImgScale({ imgScale: value });
  };

  return (
    <div className="w-6/12">
      <h3>Image Scale</h3>

      <Slider
        min={1}
        max={3}
        step={1}
        value={imgScale}
        onChange={handleChange}
        marks={[
          { value: 1, label: "1x" },
          { value: 2, label: "2x" },
          { value: 3, label: "3x" },
        ]}
      />
    </div>
  );
}
