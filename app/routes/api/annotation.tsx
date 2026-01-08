import { createAnnotation, updateAnnotation } from "~/models/annotation.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { Route } from "./+types/annotation";

export async function action({ request }: Route.ActionArgs) {
  console.log("+++ API action called");

  const formData = await request.formData();

  const polygons = formData.get("polygons") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const user = await requireUserIdWithRedirect(request);
  const projectId = formData.get("projectId") as string | null;

  if (projectId) {
    updateAnnotation({
      id: projectId,
      polygons: polygons,
      imageUrl,
      imageWidth: formData.get("imageWidth") as string | null,
      imageHeight: formData.get("imageHeight") as string | null,
      userId: user.id,
    });
    return;
  }

  return createAnnotation({
    polygons: polygons,
    imageUrl,
    imageWidth: formData.get("imageWidth") as string | null,
    imageHeight: formData.get("imageHeight") as string | null,
    userId: user.id,
  });
}
