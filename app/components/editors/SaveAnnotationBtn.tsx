import { Button } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { useFetcher } from "react-router";
import { BackgroundImageStore, LabelStore } from "~/lib/editorLogic";

export function SaveAnnotationBtn({ projectId = "" }: { projectId?: string }) {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const imageUrl =
    useSelector(BackgroundImageStore, (state) => state.context.imageUrl) || "";
  const imageHeight =
    useSelector(BackgroundImageStore, (state) => state.context.imageHeight) ||
    0;
  const imageWidth =
    useSelector(BackgroundImageStore, (state) => state.context.imageWidth) || 0;

  const fetcher = useFetcher();

  const handleSave = () => {
    const polygonData = JSON.stringify(polygons);
    const formData = new FormData();
    formData.append("polygons", polygonData);
    formData.append("imageUrl", imageUrl);
    formData.append("imageWidth", imageWidth.toString());
    formData.append("imageHeight", imageHeight.toString());
    formData.append("projectId", projectId);

    fetcher.submit(formData, { method: "post" });
  };

  const isSubmitting = fetcher.state !== "idle";
  console.log("SaveAnnotationBtn render, isSubmitting:", isSubmitting);

  return (
    <fetcher.Form method="post">
      <Button
        disabled={isSubmitting}
        onClick={handleSave}
        variant="filled"
        color="blue"
      >
        {isSubmitting ? "Saving..." : "Save Annotation"}
      </Button>
    </fetcher.Form>
  );
}
