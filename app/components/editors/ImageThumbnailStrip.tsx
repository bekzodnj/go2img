import { useRef, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Button,
  Group,
  Popover,
  Text,
} from "@mantine/core";
import { useSelector } from "@xstate/store/react";
import { authClient } from "~/lib/auth-client";
import { PRO_PRODUCT_ID } from "~/lib/constants";
import { ImageListStore } from "~/lib/editorLogic";
import { Icon, icons } from "./icons";
import { SectionTitle } from "./SectionTitle";

export function ImageThumbnailStrip({
  onSelect,
  onFiles,
  onDelete,
  maxImages,
  error,
}: {
  onSelect: (imageId: string) => void;
  onFiles: (files: File[]) => void;
  onDelete: (imageId: string) => void;
  // Free plan cap; undefined means unlimited
  maxImages?: number;
  error?: string;
}) {
  const images = useSelector(ImageListStore, (state) => state.context.images);
  const currentImageId = useSelector(
    ImageListStore,
    (state) => state.context.currentImageId,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  // Which thumbnail's delete confirmation is open
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const atLimit = maxImages !== undefined && images.length >= maxImages;

  return (
    <div
      style={{
        padding: 12,
        borderBottom: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <SectionTitle count={images.length}>Images</SectionTitle>

      <Button
        fullWidth
        variant="light"
        leftSection={<Icon d={icons.upload} />}
        onClick={() => inputRef.current?.click()}
        disabled={atLimit}
      >
        Upload images
      </Button>

      {atLimit ? (
        <Text size="xs" c="dimmed" mt={6}>
          The free plan includes {maxImages}{" "}
          {maxImages === 1 ? "image" : "images"} per project.{" "}
          <Anchor
            component="button"
            size="xs"
            onClick={() => authClient.checkout({ products: [PRO_PRODUCT_ID] })}
          >
            Upgrade to Pro
          </Anchor>
        </Text>
      ) : null}

      {error ? (
        <Text size="xs" c="red.7" mt={6}>
          {error}
        </Text>
      ) : null}

      {images.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
            marginTop: 12,
            overflowY: "auto",
            maxHeight: 240,
          }}
        >
          {images.map((image, index) => {
            const isCurrent = currentImageId === image.id;
            return (
              <div key={image.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(image.id)}
                  aria-label={`Open image ${index + 1}`}
                  aria-current={isCurrent}
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    padding: 0,
                    borderRadius: 6,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "var(--mantine-color-gray-1)",
                    border: "1px solid var(--mantine-color-gray-3)",
                    outline: isCurrent
                      ? "2px solid var(--mantine-color-blue-6)"
                      : "none",
                    outlineOffset: 1,
                  }}
                >
                  <img
                    src={image.url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </button>
                <span
                  style={{
                    position: "absolute",
                    left: 4,
                    top: 4,
                    background: "rgba(0,0,0,0.55)",
                    color: "white",
                    fontSize: 10,
                    lineHeight: 1,
                    padding: "2px 5px",
                    borderRadius: 4,
                    pointerEvents: "none",
                  }}
                >
                  {index + 1}
                </span>

                <Popover
                  opened={confirmingId === image.id}
                  onChange={(opened) => !opened && setConfirmingId(null)}
                  position="bottom"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    {/* Shown on hover, and always on the open image (touch has no hover) */}
                    <ActionIcon
                      size="sm"
                      variant="white"
                      color="red"
                      aria-label={`Delete image ${index + 1}`}
                      onClick={() => setConfirmingId(image.id)}
                      // inline: Mantine's own styles win over a Tailwind `absolute`
                      style={{ position: "absolute", top: 4, right: 4 }}
                      className={`transition-opacity focus:opacity-100 group-hover:opacity-100 ${
                        isCurrent || confirmingId === image.id
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <Icon d={icons.trash} size={14} />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Text size="sm" mb="xs">
                      Delete image {index + 1} and its polygons?
                    </Text>
                    <Group gap="xs" justify="flex-end">
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => {
                          setConfirmingId(null);
                          onDelete(image.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Popover.Dropdown>
                </Popover>
              </div>
            );
          })}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxImages === undefined}
        hidden
        onChange={(e) => {
          const files = Array.from(e.currentTarget.files ?? []);
          if (files.length > 0) {
            onFiles(files);
          }
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
