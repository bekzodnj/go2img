import { LocalFileStorage } from "@mjackson/file-storage/local";

export const fileStorage = new LocalFileStorage("./uploads/files");
export const getStorageKey = (userId: string, materialTitle: string) => {
  return `file-${userId}-${materialTitle}`;
};

export const getStorageKeyForDownload = (fileKey: string) => {
  return fileKey;
};

// export const pdfUploadHandler = (
//   fileUpload: FileUpload,
//   userId: string,
//   materialTitle = "",
// ) => {
//   if (
//     fileUpload.fieldName === "file" &&
//     fileUpload.type === "application/pdf"
//   ) {
//     const storageKey = getStorageKey(userId, materialTitle);
//     fileStorage.set(storageKey, fileUpload);
//     return fileStorage.get(storageKey);
//   }
// };
