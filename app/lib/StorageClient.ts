import { ok } from "assert";
import { AwsClient } from "aws4fetch";
import { err, ResultAsync } from "neverthrow";

interface ImageOptions {
  contentType?: string;
}

const R2_URL = process.env.R2_STORAGE_BASE_URL;

class StorageClient {
  private client: AwsClient;

  constructor() {
    this.client = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      service: "s3",
      region: "auto",
    });
  }

  async upload(key: string, body: Buffer, opts?: ImageOptions) {
    const contentType = opts?.contentType ?? "application/octet-stream";

    const headers: Record<string, string> = {
      "Content-Length": body.byteLength.toString(),
      "Content-Type": contentType,
    };
    // Wrap Buffer in Uint8Array to make it compatible with Blob
    const blob = new Blob([new Uint8Array(body)], { type: contentType });

    const res = await ResultAsync.fromPromise(
      this.client.fetch(`${process.env.R2_STORAGE_BASE_URL}/${key}`, {
        method: "PUT",
        body: blob,
        headers,
      }),
      (e: unknown) => err(e),
    );

    if (res.isErr()) {
      console.error("Upload failed:", res.error);
      throw new Error("Failed to upload file");
    }

    return {
      key,
      url: `${R2_URL}/${key}`,
      devUrl: `${process.env.R2_DEV_URL}/${key}`,
      ok: true,
    };
  }

  async delete(key: string) {
    const res = await ResultAsync.fromPromise(
      this.client.fetch(`${process.env.R2_STORAGE_BASE_URL}/${key}`, {
        method: "DELETE",
      }),
      (e: unknown) => err(e),
    );

    if (res.isErr()) {
      console.error("Delete failed:", res.error);
      throw new Error("Failed to delete file");
    }

    return true;
  }

  async get(key: string) {
    const res = await ResultAsync.fromPromise(
      this.client.fetch(`${process.env.R2_STORAGE_BASE_URL}/${key}`, {
        method: "GET",
      }),
      (e: unknown) => err(e),
    );

    if (res.isErr()) {
      console.error("Get failed:", res.error);
      throw new Error("Failed to get file");
    }

    return res.value;
  }
}

export const storage = new StorageClient();
