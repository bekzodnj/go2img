import { useRef } from "react";
import { Button, Paper, Text } from "@mantine/core";
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
      p="xs"
      radius="md"
      style={{
        border: "1px solid #E5E7EB",
        background: "white",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text size="xs" c="dimmed" fw={500}>
          Images ({images.length})
        </Text>
        <Button
          size="compact-xs"
          variant="light"
          color="gray"
          onClick={() => inputRef.current?.click()}
        >
          + Add
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflowY: "auto",
          maxHeight: 260,
        }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onSelect(image.id)}
            title={`Image ${index + 1}`}
            style={{
              position: "relative",
              width: "100%",
              height: 64,
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
            <span
              style={{
                position: "absolute",
                left: 6,
                top: 6,
                background: "rgba(0,0,0,0.55)",
                color: "white",
                fontSize: 11,
                lineHeight: 1,
                padding: "3px 6px",
                borderRadius: 4,
              }}
            >
              {index + 1}
            </span>
          </button>
        ))}

        {images.length === 0 ? (
          <Text size="xs" c="gray.5" style={{ textAlign: "center", padding: "0.5rem 0" }}>
            No images yet
          </Text>
        ) : null}
      </div>

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
    </Paper>
  );
}
