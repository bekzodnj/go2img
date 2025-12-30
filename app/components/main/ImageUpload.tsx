import { Group, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Form, useSubmit } from "react-router";
import { fa } from "zod/v4/locales";

export function ImageUpload() {
  const submit = useSubmit();
  async function handleDrop(files: File[]) {
    const [file] = files;

    const formData = new FormData();
    formData.append("fileUpload", file);

    submit(formData, {
      method: "post",
      navigate: false,
      action: "/api/upload/image",
      encType: "multipart/form-data",
    });
  }

  return (
    <div>
      <Form
        action="/api/upload/image"
        method="POST"
        encType="multipart/form-data"
        navigate={false}
      >
        <Dropzone
          name="fileUpload"
          onDrop={handleDrop}
          onReject={(files) => console.log("rejected files", files)}
          maxSize={5 * 1024 ** 2}
          accept={IMAGE_MIME_TYPE}
        >
          <Group
            justify="center"
            gap="xl"
            mih={220}
            style={{ pointerEvents: "none" }}
          >
            <Dropzone.Accept>
              <p>Accept</p>
            </Dropzone.Accept>
            <Dropzone.Reject>
              <p>Upload error</p>
            </Dropzone.Reject>
            <Dropzone.Idle>
              {" "}
              <p>Upload a file</p>
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag images here or click to select files
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed
                5mb
              </Text>
            </div>
          </Group>
        </Dropzone>
        <button type="submit">Upload</button>
      </Form>
    </div>
  );
}
