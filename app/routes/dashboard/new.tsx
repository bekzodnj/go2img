import {
  Button,
  Checkbox,
  Container,
  FileInput,
  SegmentedControl,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";

import {
  data,
  Form,
  redirect,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { createMaterial, getCategories } from "~/models/material.server";
import { requireUserId, requireUserIdWithRedirect } from "~/session.server";
import { fileStorage, getStorageKey } from "~/server/storage.server";
import { FileUpload, parseFormData } from "@mjackson/form-data-parser";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserIdWithRedirect(request);
  const categories = await getCategories();
  return data(categories);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUserIdWithRedirect(request);

  const cloneReq = request.clone();
  const formDataCopy = await cloneReq.formData();
  const fileAttachment = formDataCopy.get("fileAttachment") as File | undefined;

  console.log("fileAttachment", fileAttachment);

  const isFileAttached =
    fileAttachment !== null && fileAttachment !== undefined;
  let fileName = fileAttachment?.name.replace(/\s+/g, "_") || null;

  if (isFileAttached) {
    fileName = null;
  }

  const pdfUploadHandler = async (fileUpload: FileUpload) => {
    if (
      fileUpload.fieldName === "fileAttachment" &&
      ["application/pdf", "image/jpeg", "image/png"].includes(fileUpload.type)
    ) {
      const storageKey = getStorageKey(user.id, fileName as string);
      await fileStorage.set(storageKey, fileUpload);
      console.log("processed:", fileStorage.get(storageKey));
    }
  };

  const formData = await parseFormData(request, pdfUploadHandler);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const url = formData.get("url") as string;

  await createMaterial({
    title,
    description,
    categoryId,
    url: url?.toString() || null,
    userId: user.id,
    filePath: isFileAttached
      ? getStorageKey(user.id, fileName as string)
      : null,
  });

  return redirect(`/dashboard`);
};

export default function CreatePage() {
  const data = useLoaderData<typeof loader>();
  const [value, setValue] = useState("url");

  const categoryData = data.map((category) => {
    return {
      label: category.name,
      value: category.id,
    };
  });

  return (
    <Container size={"sm"}>
      <Form method="POST" encType="multipart/form-data">
        <TextInput
          required
          withAsterisk
          name="title"
          label="Your new page title"
          placeholder="Awesome page"
          mb="md"
        />

        <Select
          name="categoryId"
          withAsterisk
          required
          label="What is this page about?"
          placeholder="Pick value or enter anything"
          data={categoryData}
          mb="md"
          searchable
        />

        <Textarea
          name="description"
          placeholder="Description for your page"
          label="Awesome new page"
          autosize
          minRows={4}
          mb="md"
        />

        <SegmentedControl
          value={value}
          onChange={setValue}
          mb={"sm"}
          data={[
            { label: "URL", value: "url" },
            { label: "File", value: "file" },
          ]}
        />

        {value === "url" ? (
          <TextInput
            required={value === "url"}
            name="url"
            label="Page link or URL"
            placeholder="Website Link or URL"
            mb="md"
          />
        ) : (
          // <FileInput
          // required={true}
          // name="fileAttachment"
          // label="Upload a PDF file"
          // placeholder="Upload pdf, jpg, or png files"
          // mb="md"
          // accept="application/pdf, image/jpeg, image/png"
          // />

          <Container mb="xl">
            <Text>Upload a PDF file</Text>
            <input
              type="file"
              id="fileAttachment"
              required={true}
              name="fileAttachment"
              placeholder="Upload pdf, jpg, or png files"
              accept="application/pdf, image/jpeg, image/png"
            />
          </Container>
        )}

        <Checkbox mb="md" name="isPublished" label="Publish the page" />

        <Button type="submit">Submit</Button>
      </Form>
    </Container>
  );
}
