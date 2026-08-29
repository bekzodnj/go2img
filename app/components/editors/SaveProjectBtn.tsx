import { Button } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import {
  BackgroundImageStore,
  ImageListStore,
  LabelStore,
} from "~/lib/editorLogic";

export function SaveProjectBtn({ projectId = "" }: { projectId?: string }) {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const imageId = useSelector(
    ImageListStore,
    (state) => state.context.currentImageId,
  );
  const imageUrl =
    useSelector(BackgroundImageStore, (state) => state.context.imageUrl) || "";
  const imageHeight =
    useSelector(BackgroundImageStore, (state) => state.context.imageHeight) ||
    0;
  const imageWidth =
    useSelector(BackgroundImageStore, (state) => state.context.imageWidth) || 0;

  const fetcher = useFetcher({ key: "editor-action" });

  const buildFormData = useCallback(() => {
    const formData = new FormData();
    formData.append("polygons", JSON.stringify(polygons));
    formData.append("imageUrl", imageUrl);
    formData.append("imageWidth", imageWidth.toString());
    formData.append("imageHeight", imageHeight.toString());
    formData.append("projectId", projectId);
    formData.append("imageId", imageId ?? "");
    return formData;
  }, [polygons, imageUrl, imageWidth, imageHeight, projectId, imageId]);

  const handleSave = () => {
    fetcher.submit(buildFormData(), { method: "post" });
  };

  const isSubmitting = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post">
      <Button
        disabled={isSubmitting}
        onClick={handleSave}
        variant="light"
        color="blue"
      >
        {isSubmitting ? "Saving..." : "Save Progress"}
      </Button>
    </fetcher.Form>
  );
}
