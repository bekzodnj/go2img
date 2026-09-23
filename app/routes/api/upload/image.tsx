import { ActionFunctionArgs, replace } from "react-router";
import { storage } from "~/lib/StorageClient";
import {
  addImageToProject,
  createEmptyProject,
  getProjectById,
  updateImage,
} from "~/models/project.server";
import { requireUserIdWithRedirect } from "~/session.server";

export async function action({ request, url }: ActionFunctionArgs) {
  const formData = await request.formData();
  const files = formData.getAll("fileUpload") as File[];

  const user = await requireUserIdWithRedirect(request, url);

  const uploadFile = async (file: File) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${Date.now()}-${file.name}`;

    return storage.upload(key, buffer, {
      contentType: file.type,
    });
  };

  let projectId = formData.get("projectId") as string | null;
  const isNewProject = !projectId;

  // Replace mode: swap the file behind an existing image, keeping its slide
  const replaceImageId = formData.get("imageId") as string | null;
  if (replaceImageId) {
    const project = projectId
      ? await getProjectById({ id: projectId, userId: user.id })
      : null;
    if (!project?.images.some((img) => img.id === replaceImageId)) {
      throw new Response("Not Found", { status: 404 });
    }

    if (files.length !== 1) {
      throw new Response("Expected exactly one file", { status: 400 });
    }

    const upload = await uploadFile(files[0]);
    // Width/height are measured by the canvas once the new file loads
    const image = await updateImage({
      id: replaceImageId,
      imageUrl: upload.devUrl,
      imageWidth: 0,
      imageHeight: 0,
    });

    return Response.json({
      projectId,
      uploads: [upload],
      replacedImage: image,
    });
  }

  const uploads = await Promise.all(files.map(uploadFile));

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

  // A new project lives at its own URL; its loader then brings in the images
  if (isNewProject) {
    return replace(`/editor/${projectId}`);
  }

  return new Response(JSON.stringify({ projectId, uploads, images }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
