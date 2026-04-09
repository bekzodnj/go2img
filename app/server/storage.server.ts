import { LocalFileStorage } from "@remix-run/file-storage/local";

export const fileStorage = new LocalFileStorage("./uploads/files");
export const getStorageKey = (userId: string, materialTitle: string) => {
  return `file-${userId}-${materialTitle}`;
};

export const getStorageKeyForDownload = (fileKey: string) => {
  return fileKey;
};
