import {
  createProject,
  upsertPolygons,
  addImageToProject,
  updateImage,
  getProjectById,
} from "~/models/project.server";
import { requireUserIdWithRedirect } from "~/session.server";
import {
  getPlan,
  IMAGE_LIMIT_MESSAGE,
  planLimitError,
  PROJECT_LIMIT_MESSAGE,
} from "~/lib/billing.server";
import { Route } from "./+types/project";
import { type Polygon } from "~/lib/editorLogic";

export async function action({ request, url }: Route.ActionArgs) {
  console.log("+++ API action called");

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
    if (!(await getPlan(user.id).canCreateProject())) {
      return planLimitError(PROJECT_LIMIT_MESSAGE);
    }
    const project = await createProject({
      userId: user.id,
      imageUrl: formData.get("imageUrl") as string,
      imageWidth: Number(formData.get("imageWidth")),
      imageHeight: Number(formData.get("imageHeight")),
    });
    await upsertPolygons({ imageId: project.images[0].id, polygons });
    return { projectId: project.id, imageId: project.images[0].id };
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

  const project = await getProjectById({ id: projectId, userId: user.id });
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }
  if (!(await getPlan(user.id).canAddImages(project.images.length, 1))) {
    return planLimitError(IMAGE_LIMIT_MESSAGE);
  }

  const image = await addImageToProject({
    projectId,
    imageUrl: formData.get("imageUrl") as string,
    imageWidth: Number(formData.get("imageWidth")),
    imageHeight: Number(formData.get("imageHeight")),
  });
  await upsertPolygons({ imageId: image.id, polygons });
  return { projectId, imageId: image.id };
}
