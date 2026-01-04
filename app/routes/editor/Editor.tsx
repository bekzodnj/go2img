import {
  AppShell,
  Burger,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Group,
  Input,
  ScrollArea,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { lazy, use, useEffect, useState } from "react";
import { Link, useFetcher } from "react-router";
import { BackgroundImageStore, type Polygon } from "~/lib/editorLogic";
import ClientOnly from "~/components/ClientOnly";
import { useSelector } from "@xstate/store/react";
import { LabelStore } from "~/lib/editorLogic";

import { LabelNav } from "../../components/editors/LabelNav";
import { ColorPickerPanel } from "~/components/editors/ColorPickerPanel";
import { OutputCodeBlock } from "~/components/editors/OutputCodeBlock";
import { ImageScaleSlider } from "~/components/editors/ImageScaleSlider";
import { ImageUpload } from "~/components/main/ImageUpload";
import { Route } from "./+types/Editor";
import { getAnnotationById } from "~/models/annotation.server";
import { requireUserIdWithRedirect } from "~/session.server";

const Canvas = lazy(() => import("~/components/Canvas"));
const ImageMap = lazy(() => import("~/components/ImageMap"));

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  if (!params.projectId) {
    return {};
  }

  const user = await requireUserIdWithRedirect(request);

  const projectId = params.projectId;
  const annotation = await getAnnotationById({
    id: projectId,
    userId: user.id,
  });

  if (!annotation) {
    throw new Response("Not Found", { status: 404 });
  }

  return { annotation };
};

export default function Editor({ loaderData }: Route.ComponentProps) {
  const selectedPolygonId = useSelector(
    LabelStore,
    (state) => state.context.selectedPolygonId,
  );
  const fetcher = useFetcher();

  useEffect(() => {
    console.log("+++ loaderData changed:", loaderData.annotation);
    if (loaderData.annotation) {
      const annotation = loaderData.annotation;
      // Load background image
      BackgroundImageStore.trigger.setImageUrl({
        imageUrl: annotation.imageUrl || "",
      });
      BackgroundImageStore.trigger.setSizeImage({
        imageWidth: Number(annotation.imageWidth) || 0,
        imageHeight: Number(annotation.imageHeight) || 0,
      });

      // Load polygons
      const polygons: Polygon[] = JSON.parse(annotation.polygons);
      LabelStore.trigger.setPolygons({ polygons });
    }
  }, [loaderData.annotation]);

  const polygons2 = useSelector(LabelStore, (state) => state.context.polygons);
  const selectedPolygon = polygons2.find((p) => p.id === selectedPolygonId);

  const [opened, { toggle }] = useDisclosure();
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  const imageUrl =
    useSelector(BackgroundImageStore, (state) => state.context.imageUrl) || "";
  const imageHeight =
    useSelector(BackgroundImageStore, (state) => state.context.imageHeight) ||
    0;
  const imageWidth =
    useSelector(BackgroundImageStore, (state) => state.context.imageWidth) || 0;

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

      <AppShell.Navbar p="sm" w={300}>
        Polygons
        <LabelNav />
      </AppShell.Navbar>
      <AppShell.Main>
        <div>
          <ImageUpload />
          <Space h="md" />
          <div>
            <Button
              variant="light"
              onClick={() => {
                const formData = new FormData();
                formData.append("imageUrl", imageUrl);
                formData.append("polygons", JSON.stringify(polygons2));
                formData.append("imageWidth", imageWidth.toString());
                formData.append("imageHeight", imageHeight.toString());

                fetcher.submit(formData, {
                  method: "post",
                  action: "/api/annotation",
                  encType: "multipart/form-data",
                });
              }}
            >
              Save progress
            </Button>
          </div>
          <Flex direction="column">
            <div className="w-[820px]">
              <ClientOnly>
                <Canvas setPolygonsCopy={setPolygons} />
              </ClientOnly>
            </div>

            {/* todo SVG logic here */}
            {/* <div className="w-[800px]">
              <ClientOnly>
                <ImageMap polygonsCopy={polygons} />
              </ClientOnly>
            </div> */}
          </Flex>
        </div>
      </AppShell.Main>
      <AppShell.Aside p="xs" w={300}>
        <ScrollArea h={850} type="auto">
          Label Settings
          <div>
            {selectedPolygonId !== null && selectedPolygon ? (
              <TextInput
                label="Label name"
                placeholder="Shape name"
                value={
                  selectedPolygon?.name !== undefined
                    ? selectedPolygon.name
                    : ""
                }
                onChange={(event) => {
                  event.preventDefault();
                  if (!selectedPolygonId) return;
                  LabelStore.trigger.changeLabelName({
                    id: selectedPolygonId!,
                    newName: event.currentTarget.value,
                  });
                }}
              />
            ) : null}
            <ColorPickerPanel />
            <Space h="md" />
            <Divider my="sm" />
            <ImageScaleSlider />
            <Space h="md" />
            <Divider my="sm" />
            <OutputCodeBlock />
          </div>
        </ScrollArea>
      </AppShell.Aside>
    </AppShell>
  );
}
