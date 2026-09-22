import {
  AppShell,
  Burger,
  Flex,
  Group,
  ScrollArea,
  Space,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { lazy, useCallback, useEffect, useRef } from "react";
import {
  Link,
  type ShouldRevalidateFunctionArgs,
  useFetcher,
  useNavigate,
} from "react-router";
import {
  BackgroundImageStore,
  ImageListStore,
  type ImageItem,
  type Polygon,
} from "~/lib/editorLogic";
import ClientOnly from "~/components/ClientOnly";
import { LabelStore } from "~/lib/editorLogic";

import { LabelNav } from "../../components/editors/LabelNav";
import { Route } from "./+types/Editor";
import {
  createProject,
  getProjectById,
  upsertPolygons,
  addImageToProject,
  updateImage,
} from "~/models/project.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { SaveProjectBtn } from "~/components/editors/SaveProjectBtn";
import { RightSidePanel } from "~/components/editors/RightSidePanel";
import { ImageThumbnailStrip } from "~/components/editors/ImageThumbnailStrip";

const Canvas = lazy(() => import("~/components/Canvas"));

export const loader = async ({ request, url, params }: Route.LoaderArgs) => {
  if (!params.projectId) {
    return {};
  }
  const user = await requireUserIdWithRedirect(request, url);

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

export const action = async ({ request, url }: Route.ActionArgs) => {
  console.log("+++ Editor action called");
  const formData = await request.formData();

  const user = await requireUserIdWithRedirect(request, url);
  const projectId = formData.get("projectId") as string | null;
  const imageId = formData.get("imageId") as string | null;

  const polygonsRaw = formData.get("polygons") as string;
  const polygons: {
    label: string;
    color: string;
    points: unknown;
    order: number;
  }[] = polygonsRaw
    ? JSON.parse(polygonsRaw).map((p: Polygon, i: number) => ({
        label: p.label || p.name || "",
        color: p.color,
        points: p.points,
        order: i,
      }))
    : [];

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
    const imageUrl = formData.get("imageUrl") as string;
    const imageWidth = Number(formData.get("imageWidth"));
    const imageHeight = Number(formData.get("imageHeight"));
    if (imageUrl || imageWidth || imageHeight) {
      await updateImage({ id: imageId, imageUrl, imageWidth, imageHeight });
    }
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
  const flushFetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const navigate = useNavigate();

  const flushSubmitRef = useRef(flushFetcher.submit);
  flushSubmitRef.current = flushFetcher.submit;
  const processedUploadRef = useRef<unknown>(null);

  const polygonsCacheRef = useRef<Map<string, Polygon[]>>(new Map());

  const loadImageIntoStores = useCallback((image: ImageItem) => {
    ImageListStore.trigger.setCurrentImage({ id: image.id });
    BackgroundImageStore.trigger.setImageUrl({ imageUrl: image.url || "" });
    BackgroundImageStore.trigger.setSizeImage({
      imageWidth: image.width || 0,
      imageHeight: image.height || 0,
    });
    const polygons = polygonsCacheRef.current.get(image.id) ?? [];
    LabelStore.trigger.setPolygons({ polygons });
    LabelStore.trigger.setSelectedPolygon({ id: null });
  }, []);

  const flushCurrentImage = useCallback(() => {
    const currentId = ImageListStore.getSnapshot().context.currentImageId;
    if (!currentId || !params.projectId) return;

    const polygons = LabelStore.getSnapshot().context.polygons;
    polygonsCacheRef.current.set(currentId, polygons);

    const bg = BackgroundImageStore.getSnapshot().context;
    const formData = new FormData();
    formData.append("projectId", params.projectId);
    formData.append("imageId", currentId);
    formData.append("polygons", JSON.stringify(polygons));
    formData.append("imageUrl", bg.imageUrl ?? "");
    formData.append("imageWidth", String(bg.imageWidth));
    formData.append("imageHeight", String(bg.imageHeight));
    flushSubmitRef.current(formData, { method: "post" });
  }, [params.projectId]);

  const handleSelectImage = useCallback(
    (imageId: string) => {
      const currentId = ImageListStore.getSnapshot().context.currentImageId;
      if (currentId === imageId) return;

      flushCurrentImage();

      const image = ImageListStore.getSnapshot().context.images.find(
        (i) => i.id === imageId,
      );
      if (image) {
        loadImageIntoStores(image);
      }
    },
    [flushCurrentImage, loadImageIntoStores],
  );

  const handleFiles = (files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("fileUpload", file);
    }
    if (params.projectId) {
      formData.append("projectId", params.projectId);
    }
    uploadFetcher.submit(formData, {
      method: "post",
      action: "/api/upload/image",
      encType: "multipart/form-data",
    });
  };

  useEffect(() => {
    if (loaderData.project) {
      const project = loaderData.project;

      const images: ImageItem[] = project.images.map((img) => ({
        id: img.id,
        url: img.url,
        width: img.width,
        height: img.height,
        order: img.order,
      }));
      ImageListStore.trigger.setImages({ images });

      project.images.forEach((img) => {
        polygonsCacheRef.current.set(
          img.id,
          img.polygons.map((p) => ({
            id: p.id,
            points: p.points as Polygon["points"],
            isClosed: true,
            color: p.color,
            label: p.label,
            name: p.label,
          })),
        );
      });

      const currentId = ImageListStore.getSnapshot().context.currentImageId;
      const target =
        project.images.find((img) => img.id === currentId) ?? project.images[0];
      if (target) {
        loadImageIntoStores({
          id: target.id,
          url: target.url,
          width: target.width,
          height: target.height,
          order: target.order,
        });
      }
    } else {
      ImageListStore.trigger.setImages({ images: [] });
      ImageListStore.trigger.setCurrentImage({ id: null });
      polygonsCacheRef.current.clear();
      BackgroundImageStore.trigger.clearImageUrl();
      BackgroundImageStore.trigger.setSizeImage({
        imageWidth: 0,
        imageHeight: 0,
      });
      LabelStore.trigger.setSelectedPolygon({ id: null });
      LabelStore.trigger.reset();
    }
  }, [loaderData.project, loadImageIntoStores]);

  useEffect(() => {
    if (fetcher.data) {
      console.log("+++ fetcher.data:", fetcher.data);
      if (fetcher.data?.projectId) {
        navigate(`/editor/${fetcher.data.projectId}`, { replace: true });
      }
    }
  }, [fetcher.data, navigate]);

  useEffect(() => {
    const data = uploadFetcher.data as
      | {
          projectId?: string;
          uploads?: { devUrl: string }[];
          images?: ImageItem[];
        }
      | undefined;
    if (!data || data === processedUploadRef.current) return;
    processedUploadRef.current = data;

    if (data.images && data.images.length > 0) {
      flushCurrentImage();
      data.images.forEach((image) => {
        ImageListStore.trigger.addImage({ image });
      });
      loadImageIntoStores(data.images[data.images.length - 1]);

      if (data.projectId && data.projectId !== params.projectId) {
        navigate(`/editor/${data.projectId}`, { replace: true });
      }
    }
  }, [
    uploadFetcher.data,
    flushCurrentImage,
    loadImageIntoStores,
    params.projectId,
    navigate,
  ]);

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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 12,
            background: "#F3F4F6",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <ImageThumbnailStrip
            onSelect={handleSelectImage}
            onFiles={handleFiles}
          />
          <LabelNav />
        </div>
      </AppShell.Navbar>
      <AppShell.Main>
        <div>
          <Space h="md" />
          <div>
            <SaveProjectBtn projectId={params.projectId} />
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
          <RightSidePanel onFiles={handleFiles} />
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
