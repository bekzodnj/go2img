import { Group, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";

export function ImageUpload() {
  function handleDrop(files: File[]) {
    const [file] = files;
  }

  return (
    <div>
      <Dropzone
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
          <Dropzone.Accept>Accept</Dropzone.Accept>
          <Dropzone.Reject>Upload error</Dropzone.Reject>
          <Dropzone.Idle>Upload a file</Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag images here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
    </div>
  );
}
