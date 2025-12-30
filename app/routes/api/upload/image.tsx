import { ActionFunctionArgs } from "react-router";
import { storage } from "~/lib/StorageClient";

// action.ts
export async function action2({ request }: any) {
  const formData = await request.formData();
  const file = formData.get("avatar") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  // upload to R2
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const file = formData.get("fileUpload") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  // upload to R2
  const result = await storage.upload(file.name, buffer, {
    contentType: file.type,
  });

  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
