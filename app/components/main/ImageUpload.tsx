import { Group, Text } from "@mantine/core";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect } from "react";
import { Form, useFetcher, useSubmit } from "react-router";
import { BackgroundImageStore } from "~/lib/editorLogic";

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
    return () => {};
  }, [fetcher.data]);

  return !fetcher.data ? (
    <div>
      <Dropzone
        name="fileUpload"
        onDrop={handleDrop}
        onReject={(files) => console.log("rejected files", files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        {...props}
      >
        <div>
          <Text size="xl" inline>
            Drag images here or click to select files
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Attach as many files as you like, each file should not exceed 5mb
          </Text>
        </div>
      </Dropzone>
    </div>
  ) : null;
}
