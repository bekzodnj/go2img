import { useRef } from "react";
import { Group, Paper, Text } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { ImageListStore } from "~/lib/editorLogic";

export function ImageThumbnailStrip({
  onSelect,
  onFiles,
}: {
  onSelect: (imageId: string) => void;
  onFiles: (files: File[]) => void;
}) {
  const images = useSelector(ImageListStore, (state) => state.context.images);
  const currentImageId = useSelector(
    ImageListStore,
    (state) => state.context.currentImageId,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Paper
      shadow="xs"
      p="xs"
      radius="md"
      style={{ border: "1px solid #E5E7EB", background: "white" }}
    >
      <Group gap="xs" align="center" wrap="nowrap">
        <Text size="xs" c="dimmed" fw={500} style={{ flexShrink: 0 }}>
          Images ({images.length})
        </Text>

        <Group gap="xs" wrap="nowrap" style={{ overflowX: "auto", flex: 1 }}>
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => onSelect(image.id)}
              title={`Image ${index + 1}`}
              style={{
                width: 56,
                height: 56,
                padding: 0,
                border:
                  currentImageId === image.id
                    ? "2px solid #3B82F6"
                    : "1px solid #E5E7EB",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                background: "#F9FAFB",
                flexShrink: 0,
              }}
            >
              <img
                src={image.url}
                alt={`Slide ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ))}

          <button
            onClick={() => inputRef.current?.click()}
            title="Add images"
            style={{
              width: 56,
              height: 56,
              padding: 0,
              border: "1px dashed #CBD5E1",
              borderRadius: 8,
              cursor: "pointer",
              background: "#F9FAFB",
              fontSize: 24,
              color: "#94A3B8",
              flexShrink: 0,
            }}
          >
            +
          </button>
        </Group>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files ?? []);
            if (files.length > 0) {
              onFiles(files);
            }
            e.currentTarget.value = "";
          }}
        />
      </Group>
    </Paper>
  );
}
