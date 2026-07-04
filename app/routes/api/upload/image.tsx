import { ActionFunctionArgs } from "react-router";
import { storage } from "~/lib/StorageClient";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const file = formData.get("fileUpload") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  // upload to R2
  const result = await storage.upload(file.name, buffer, {
    contentType: file.type,
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
