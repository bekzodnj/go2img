import { Group, Text, Stack } from "@mantine/core";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { BackgroundImageStore } from "~/lib/editorLogic";

/* ---------- Minimal SVG Icon ---------- */
function ImageIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.8 }}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export function ImageUpload(props: Partial<DropzoneProps>) {
  const fetcher = useFetcher();

  async function handleDrop(files: File[]) {
    const [file] = files;

    const formData = new FormData();
    formData.append("fileUpload", file);

    fetcher.submit(formData, {
      method: "post",
      action: "/api/upload/image",
      encType: "multipart/form-data",
    });
  }

  useEffect(() => {
    if (fetcher.data) {
      BackgroundImageStore.trigger.setImageUrl({
        imageUrl: fetcher.data.devUrl,
      });
    }
  }, [fetcher.data]);

  if (fetcher.data) return null;

  return (
    <>
      <Text size="sm" c="dimmed">
        Upload another image
      </Text>
      <Dropzone
        name="fileUpload"
        onDrop={handleDrop}
        onReject={(files) => console.log("rejected files", files)}
        maxSize={6 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        radius="md"
        p="xl"
        styles={{
          root: {
            borderStyle: "dashed",
            borderWidth: 1,
            transition: "border-color 120ms ease, background-color 120ms ease",
          },
        }}
        {...props}
      >
        <Stack align="center" gap={6}>
          <ImageIcon />

          <Text size="sm" fw={500} style={{ letterSpacing: "-0.01em" }}>
            Upload image to annotate
          </Text>

          <Text size="xs" c="dimmed">
            Image file · Max 6 MB
          </Text>
        </Stack>
      </Dropzone>
    </>
  );
}
