import {
  createProject,
  upsertPolygons,
  addImageToProject,
} from "~/models/project.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { Route } from "./+types/project";
import { type Polygon } from "~/lib/editorLogic";

export async function action({ request }: Route.ActionArgs) {
  console.log("+++ API action called");

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
    await upsertPolygons({ imageId: project.images[0].id, polygons });
    return { projectId: project.id, imageId: project.images[0].id };
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
}
