import { deleteImage } from "~/models/project.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { Route } from "./+types/route";

export async function action({ request, url, params }: Route.ActionArgs) {
  if (request.method !== "DELETE") {
    throw new Response("Method Not Allowed", { status: 405 });
  }
  const user = await requireUserIdWithRedirect(request, url);

  const { count } = await deleteImage({ id: params.id, userId: user.id });
  if (count === 0) {
    throw new Response("Not Found", { status: 404 });
  }
  return { deletedImageId: params.id };
}
