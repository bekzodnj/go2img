import { ActionFunctionArgs } from "react-router";
import { storage } from "~/lib/StorageClient";
import {
  addImageToProject,
  createEmptyProject,
  getProjectById,
} from "~/models/project.server";
import { requireUserIdWithRedirect } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const files = formData.getAll("fileUpload") as File[];

  const user = await requireUserIdWithRedirect(request);

  const uploads = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `${Date.now()}-${file.name}`;

      return storage.upload(key, buffer, {
        contentType: file.type,
      });
    }),
  );

  let projectId = formData.get("projectId") as string | null;

  if (!projectId) {
    const project = await createEmptyProject({ userId: user.id });
    projectId = project.id;
  } else {
    const project = await getProjectById({ id: projectId, userId: user.id });
    if (!project) {
      throw new Response("Not Found", { status: 404 });
    }
  }

  const images = await Promise.all(
    uploads.map((upload) =>
      addImageToProject({
        projectId,
        imageUrl: upload.devUrl,
        imageWidth: 0,
        imageHeight: 0,
      }),
    ),
  );

  return new Response(JSON.stringify({ projectId, uploads, images }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
