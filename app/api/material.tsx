import { fileStorage, getStorageKeyForDownload } from "~/server/storage.server";
import { Route } from "./+types/material";

export async function loader({ params }: Route.LoaderArgs) {
  //const storageKey = getStorageKey(params.materialId);
  const storageKey = getStorageKeyForDownload(params.fileKey);
  const file = await fileStorage.get(storageKey);

  if (!file) {
    throw new Response("User avatar not found", {
      status: 404,
    });
  }

  return new Response(file.stream(), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `inline; filename=${file.name}`,
    },
  });
}
