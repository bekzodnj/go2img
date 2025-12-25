import { Button, Code, CopyButton, Space } from "@mantine/core";
import { useSelector, useStore } from "@xstate/store/react";
import { LabelStore } from "~/lib/editorLogic";

export function OutputCodeBlock() {
  const polygons = useSelector(LabelStore, (state) => state.context.polygons);
  const polygonsWithoutIsClosed = polygons.map(({ isClosed, ...rest }) => rest);
  const codeForPreviousDemo = JSON.stringify(polygonsWithoutIsClosed, null, 2);
  return (
    <>
      <h2>Output JSON</h2>
      <CopyButton value="https://mantine.dev">
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

      <Button ml={"2px"} variant="light" size="xs" color={"blue"}>
        Download as file
      </Button>
      <Code color="var(--mantine-color-blue-light)" block>
        {codeForPreviousDemo}
      </Code>
    </>
  );
}
