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
import { Link, useFetcher, useNavigate } from "react-router";
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
import {
  createAnnotation,
  getAnnotationById,
  updateAnnotation,
} from "~/models/annotation.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { SaveAnnotationBtn } from "~/components/editors/SaveAnnotationBtn";
import { RightSidePanel } from "~/components/editors/RightSidePanel";

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

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();

  const polygons = formData.get("polygons") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const user = await requireUserIdWithRedirect(request);
  const projectId = formData.get("projectId") as string | null;

  if (projectId) {
    return updateAnnotation({
      id: projectId,
      polygons: polygons,
      imageUrl,
      imageWidth: formData.get("imageWidth") as string | null,
      imageHeight: formData.get("imageHeight") as string | null,
      userId: user.id,
    });
  }

  return createAnnotation({
    polygons: polygons,
    imageUrl,
    imageWidth: formData.get("imageWidth") as string | null,
    imageHeight: formData.get("imageHeight") as string | null,
    userId: user.id,
  });
};

export default function Editor({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("+++ loaderData changed:", loaderData.annotation);
    if (loaderData.annotation) {
      const annotation = loaderData.annotation;

      BackgroundImageStore.trigger.setImageUrl({
        imageUrl: annotation.imageUrl || "",
      });
      BackgroundImageStore.trigger.setSizeImage({
        imageWidth: Number(annotation.imageWidth) || 0,
        imageHeight: Number(annotation.imageHeight) || 0,
      });

      const polygons: Polygon[] = JSON.parse(annotation.polygons);
      LabelStore.trigger.setPolygons({ polygons });
    } else {
      BackgroundImageStore.trigger.clearImageUrl();
      LabelStore.trigger.reset();
    }
  }, [loaderData.annotation]);

  useEffect(() => {
    if (fetcher.data) {
      console.log("+++ fetcher.data:", fetcher.data);
      navigate(`/editor/${fetcher.data.id}`, { replace: true });
    }
  }, [fetcher.data]);

  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
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
          <Link to="/app" className="block border-b p-5 text-xl">
            Back to projects
          </Link>
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
            <SaveAnnotationBtn projectId={params.projectId} />
          </div>
          <Flex direction="column">
            <div className="w-[820px]">
              <ClientOnly>
                <Canvas />
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
          <RightSidePanel />
        </ScrollArea>
      </AppShell.Aside>
    </AppShell>
  );
}
