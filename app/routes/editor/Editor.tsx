import {
  AppShell,
  Burger,
  Button,
  Flex,
  Group,
  Input,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { lazy, useState } from "react";
import { Link } from "react-router";
import { Polygon } from "~/components/Canvas";
import ClientOnly from "~/components/ClientOnly";
import { useSelector } from "@xstate/store/react";
import { editorStore, LabelStore } from "~/lib/editorLogic";

import { LabelNav } from "./LabelNav";

const Canvas = lazy(() => import("~/components/Canvas"));
const ImageMap = lazy(() => import("~/components/ImageMap"));

export default function Editor() {
  const count = useSelector(editorStore, (state) => state.context.count);
  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );

  const polygons2 = useSelector(LabelStore, (state) => state.context.polygons);
  const selectedPolygon = polygons2.find((p) => p.id === selectedPolygonId);
  console.log("~~~ selectedPolygon:", selectedPolygon, selectedPolygon?.label);

  const [opened, { toggle }] = useDisclosure();
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      aside={{
        width: 300,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <h1 className="text-3xl font-bold">
            <Link to="/">Go2Img</Link>
          </h1>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        Navbar
        <LabelNav />
      </AppShell.Navbar>
      <AppShell.Main>
        <div>
          <Flex px={"xl"} direction="column">
            <div className="w-[800px]">
              <ClientOnly>
                <Canvas setPolygonsCopy={setPolygons} />
              </ClientOnly>
            </div>

            <div className="w-[800px]">
              <ClientOnly>
                <ImageMap polygonsCopy={polygons} />
              </ClientOnly>
            </div>
          </Flex>
        </div>
      </AppShell.Main>
      <AppShell.Aside p="xs">
        Label Settings {selectedPolygonId}
        <p>{selectedPolygon?.color}</p>
        {selectedPolygonId !== null && selectedPolygon ? (
          <TextInput
            description="Input description"
            placeholder="Type label here"
            value={
              selectedPolygon?.label !== undefined ? selectedPolygon.label : ""
            }
            onChange={(event) => {
              event.preventDefault();
              if (!selectedPolygonId) return;
              LabelStore.trigger.changeLabelName({
                id: selectedPolygonId!,
                newLabel: event.currentTarget.value,
              });
            }}
          />
        ) : null}
      </AppShell.Aside>
    </AppShell>
  );
}
