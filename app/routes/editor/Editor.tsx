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
import {
  Link,
  type ShouldRevalidateFunctionArgs,
  useFetcher,
  useNavigate,
} from "react-router";
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
  createProject,
  getProjectById,
  upsertPolygons,
  addImageToProject,
} from "~/models/project.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { SaveProjectBtn } from "~/components/editors/SaveProjectBtn";
import { RightSidePanel } from "~/components/editors/RightSidePanel";

const Canvas = lazy(() => import("~/components/Canvas"));

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  if (!params.projectId) {
    return {};
  }
  const user = await requireUserIdWithRedirect(request);

  const projectId = params.projectId;
  const project = await getProjectById({
    id: projectId,
    userId: user.id,
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    project,
    imageId: project.images[0]?.id ?? null,
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  console.log("+++ Editor action called");
  const formData = await request.formData();

  const user = await requireUserIdWithRedirect(request);
  const projectId = formData.get("projectId") as string | null;
  const imageId = formData.get("imageId") as string | null;

  const polygonsRaw = formData.get("polygons") as string;
  const polygons: {
    label: string;
    color: string;
    points: unknown;
    order: number;
  }[] = polygonsRaw ? JSON.parse(polygonsRaw).map((p: Polygon, i: number) => ({
    label: p.label || p.name || "",
    color: p.color,
    points: p.points,
    order: i,
  })) : [];

  if (!projectId) {
    const project = await createProject({
      userId: user.id,
      imageUrl: formData.get("imageUrl") as string,
      imageWidth: Number(formData.get("imageWidth")),
      imageHeight: Number(formData.get("imageHeight")),
    });
    const newImageId = project.images[0].id;
    await upsertPolygons({ imageId: newImageId, polygons });
    return { projectId: project.id, imageId: newImageId };
  }

  if (imageId) {
    await upsertPolygons({ imageId, polygons });
    return { projectId, imageId };
  }

  const image = await addImageToProject({
    projectId,
    imageUrl: formData.get("imageUrl") as string,
    imageWidth: Number(formData.get("imageWidth")),
    imageHeight: Number(formData.get("imageHeight")),
  });
  await upsertPolygons({ imageId: image.id, polygons });
  return { projectId, imageId: image.id };
};

export default function Editor({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher({ key: "editor-action" });
  const navigate = useNavigate();

  const [imageId, setImageId] = useState<string | null>(loaderData.imageId ?? null);

  useEffect(() => {
    console.log("+++ loaderData changed:", loaderData.project);
    if (loaderData.project) {
      const project = loaderData.project;
      const firstImage = project.images[0];

      if (firstImage) {
        setImageId(firstImage.id);

        BackgroundImageStore.trigger.setImageUrl({
          imageUrl: firstImage.url || "",
        });

        BackgroundImageStore.trigger.setSizeImage({
          imageWidth: firstImage.width || 0,
          imageHeight: firstImage.height || 0,
        });

        const polygons: Polygon[] = firstImage.polygons.map((p) => ({
          id: p.id,
          points: p.points as Polygon["points"],
          isClosed: true,
          color: p.color,
          label: p.label,
          name: p.label,
        }));
        LabelStore.trigger.setPolygons({ polygons });
      }
    } else {
      setImageId(null);
      BackgroundImageStore.trigger.clearImageUrl();
      BackgroundImageStore.trigger.setSizeImage({
        imageWidth: 0,
        imageHeight: 0,
      });
      LabelStore.trigger.setSelectedPolygon({ id: null });
      LabelStore.trigger.reset();
    }
  }, [loaderData.project]);

  useEffect(() => {
    if (fetcher.data) {
      console.log("+++ fetcher.data:", fetcher.data);
      if (fetcher.data?.projectId) {
        setImageId(fetcher.data.imageId ?? null);
        navigate(`/editor/${fetcher.data.projectId}`, { replace: true });
      }
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
        <Group h="100%" px="md" align="center">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <h1 className="text-xl font-bold">
            <Link to="/">Go2Img</Link>
          </h1>
          <Link to="/app" className="text-base text-gray-600">
            &larr; Go back to projects
          </Link>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" w={300}>
        <LabelNav />
      </AppShell.Navbar>
      <AppShell.Main>
        <div>
          <Space h="md" />
          <div>
            <SaveProjectBtn projectId={params.projectId} imageId={imageId} />
          </div>
          <Flex direction="column">
            <div>
              <ClientOnly>
                <Canvas />
              </ClientOnly>
            </div>
          </Flex>
        </div>
      </AppShell.Main>
      <AppShell.Aside p="xs" w={300}>
        <ScrollArea h={850} type="auto">
          <RightSidePanel />
        </ScrollArea>
      </AppShell.Aside>
    </AppShell>
  );
}

export function shouldRevalidate({
  currentParams,
}: ShouldRevalidateFunctionArgs) {
  if (currentParams.projectId) {
    return false;
  }

  return true;
}
