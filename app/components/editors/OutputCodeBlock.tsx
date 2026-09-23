import { Accordion, Button, Code, Group, ScrollArea } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useSelector } from "@xstate/store/react";
import { useState } from "react";
import { BackgroundImageStore, LabelStore } from "~/lib/editorLogic";
import { Icon, icons } from "./icons";
import { SectionTitle } from "./SectionTitle";

type OutputSource = {
  polygons: ReturnType<typeof LabelStore.getSnapshot>["context"]["polygons"];
  imageWidth: number;
  imageHeight: number;
};

function toOutputJson({ polygons, imageWidth, imageHeight }: OutputSource) {
  return JSON.stringify(
    {
      imageWidth,
      imageHeight,
      polygons: polygons.map(({ isClosed, ...rest }) => rest),
    },
    null,
    2,
  );
}

// Copy and Download read the stores when clicked, so nothing is serialized
// while you draw unless the preview is open
function currentOutputJson() {
  const { imageWidth, imageHeight } =
    BackgroundImageStore.getSnapshot().context;
  const { polygons } = LabelStore.getSnapshot().context;
  return toOutputJson({ polygons, imageWidth, imageHeight });
}

export function OutputCodeBlock() {
  const clipboard = useClipboard({ timeout: 1500 });
  const [previewOpen, setPreviewOpen] = useState(false);

  const downloadFile = () => {
    const url = URL.createObjectURL(
      new Blob([currentOutputJson()], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "polygons.json";
    document.body.appendChild(link); // Firefox needs it in the document
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SectionTitle>Export JSON</SectionTitle>
      <Group gap="xs" grow>
        <Button
          size="xs"
          variant="light"
          color={clipboard.copied ? "teal" : "blue"}
          leftSection={
            <Icon d={clipboard.copied ? icons.check : icons.copy} size={14} />
          }
          onClick={() => clipboard.copy(currentOutputJson())}
        >
          {clipboard.copied ? "Copied" : "Copy"}
        </Button>
        <Button
          size="xs"
          variant="light"
          leftSection={<Icon d={icons.download} size={14} />}
          onClick={downloadFile}
        >
          Download
        </Button>
      </Group>

      <Accordion
        mt="xs"
        variant="contained"
        chevronPosition="right"
        styles={{
          label: { fontSize: "var(--mantine-font-size-sm)", paddingBlock: 8 },
        }}
        value={previewOpen ? "preview" : null}
        onChange={(value) => setPreviewOpen(value === "preview")}
      >
        <Accordion.Item value="preview">
          <Accordion.Control>Preview</Accordion.Control>
          <Accordion.Panel>
            {/* Only mounted while open: a closed panel would otherwise keep
                re-rendering the whole JSON on every edit */}
            {previewOpen ? <JsonPreview /> : null}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

function JsonPreview() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const imageWidth = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageWidth,
  );
  const imageHeight = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageHeight,
  );

  return (
    <ScrollArea.Autosize mah={320} type="auto">
      <Code block fz={11}>
        {toOutputJson({ polygons, imageWidth, imageHeight })}
      </Code>
    </ScrollArea.Autosize>
  );
}
