import { Button, Code, CopyButton, Space } from "@mantine/core";
import { useSelector, useStore } from "@xstate/store/react";
import { BackgroundImageStore, LabelStore } from "~/lib/editorLogic";

export function OutputCodeBlock() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const polygonsWithoutIsClosed = polygons.map(({ isClosed, ...rest }) => rest);
  const bgImgHeight = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageHeight,
  );
  const bgImgWidth = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageWidth,
  );

  const polygonsWithImageSize = {
    imageWidth: bgImgWidth,
    imageHeight: bgImgHeight,
    polygons: polygonsWithoutIsClosed,
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([codeForCopy], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "polygons.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const codeForCopy = JSON.stringify(polygonsWithImageSize, null, 2);
  return (
    <>
      <h2>Output JSON</h2>
      <CopyButton value={codeForCopy}>
        {({ copied, copy }) => (
          <Button
            variant="light"
            size="xs"
            color={copied ? "indigo" : "blue"}
            onClick={copy}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </CopyButton>

      <Button
        ml={"2px"}
        variant="light"
        size="xs"
        color={"blue"}
        onClick={downloadFile}
      >
        Download as file
      </Button>
      <Code color="var(--mantine-color-blue-light)" block>
        {codeForCopy}
      </Code>
    </>
  );
}
