import { ActionFunctionArgs } from "react-router";
import { storage } from "~/lib/StorageClient";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const files = formData.getAll("fileUpload") as File[];

  const uploads = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `${Date.now()}-${file.name}`;

      return storage.upload(key, buffer, {
        contentType: file.type,
      });
    }),
  );

  return new Response(JSON.stringify(uploads), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
