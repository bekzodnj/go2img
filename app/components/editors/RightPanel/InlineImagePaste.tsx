import { TextInput } from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { useEffect, useState } from "react";
import { BackgroundImageStore } from "~/lib/editorLogic";

export function InlineImagePaste() {
  const imgUrl = useSelector(
    BackgroundImageStore,
    (state) => state.context.imageUrl,
  );

  const [imageURL, setImageURL] = useState(imgUrl || "");

  useEffect(() => {
    setImageURL(imgUrl || ""); // TODO - check later with @xstate/store
  }, [imgUrl]);

  return (
    <TextInput
      value={imageURL}
      onChange={(e) => {
        setImageURL(e.currentTarget.value);
        BackgroundImageStore.trigger.setImageUrl({
          imageUrl: e.currentTarget.value,
        });
      }}
      placeholder="Or paste image URL here..."
      size="sm"
      styles={{
        input: {
          border: "1px solid #E5E7EB",
          backgroundColor: "#F9FAFB",
          fontSize: "14px",
          "&:focus": {
            borderColor: "#3B82F6",
            backgroundColor: "white",
          },
        },
      }}
    />
  );
}
