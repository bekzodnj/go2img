import { Button } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { useSelector } from "@xstate/store/react";
import { useRef, useCallback } from "react";
import { useFetcher } from "react-router";
import { BackgroundImageStore, LabelStore } from "~/lib/editorLogic";

const AUTOSAVE_DELAY_MS = 2000;

export function SaveAnnotationBtn({ projectId = "" }: { projectId?: string }) {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const imageUrl =
    useSelector(BackgroundImageStore, (state) => state.context.imageUrl) || "";
  const imageHeight =
    useSelector(BackgroundImageStore, (state) => state.context.imageHeight) ||
    0;
  const imageWidth =
    useSelector(BackgroundImageStore, (state) => state.context.imageWidth) || 0;

  const fetcher = useFetcher({ key: "editor-action" });
  const prevSnapshotRef = useRef<string>("");

  const buildFormData = useCallback(() => {
    const formData = new FormData();
    formData.append("polygons", JSON.stringify(polygons));
    formData.append("imageUrl", imageUrl);
    formData.append("imageWidth", imageWidth.toString());
    formData.append("imageHeight", imageHeight.toString());
    formData.append("projectId", projectId);
    return formData;
  }, [polygons, imageUrl, imageWidth, imageHeight, projectId]);

  const debouncedSave = useDebouncedCallback(() => {
    fetcher.submit(buildFormData(), { method: "post" });
  }, AUTOSAVE_DELAY_MS);

  // Snapshot comparison during render — triggers debounced autosave on change
  const currentSnapshot = JSON.stringify({
    polygons,
    imageUrl,
    imageWidth,
    imageHeight,
  });

  if (currentSnapshot !== prevSnapshotRef.current) {
    prevSnapshotRef.current = currentSnapshot;

    const hasContent = polygons.length > 0 || imageUrl;
    if (hasContent && !!projectId) {
      debouncedSave();
    }
  }

  const handleSave = () => {
    debouncedSave.cancel();
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
