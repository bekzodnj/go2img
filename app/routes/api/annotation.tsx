import { ActionFunctionArgs } from "react-router";
import { createAnnotation } from "~/models/annotation.server";
import { requireUserIdWithRedirect } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const metadata = formData.get("metadata") as string | null;
  const user = await requireUserIdWithRedirect(request);

  return createAnnotation({
    content,
    imageUrl,
    metadata,
    userId: user.id,
  });
}
