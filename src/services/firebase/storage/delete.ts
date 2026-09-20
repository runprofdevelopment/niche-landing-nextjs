import {
  buildStorageUrl,
  createStorageAuthHeaders,
  parseStorageErrorMessage,
  toStoragePath,
} from "./backend-storage";
import { mapFirebaseStorageError } from "./storage.errors";

import type { StorageFileReference } from "./storage.types";

/**
 * Deletes a file through the backend `/storage` endpoint.
 */
export async function deleteFile(reference: StorageFileReference): Promise<void> {
  try {
    const url = new URL(buildStorageUrl());
    url.searchParams.set("file_path", toStoragePath(reference));

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: await createStorageAuthHeaders(),
    });

    if (!response.ok) {
      let message: string | undefined;
      try {
        message = ((await response.json()) as { message?: string }).message;
      } catch {}

      throw parseStorageErrorMessage(response.status, "Failed to delete file.", message);
    }
  } catch (error) {
    throw mapFirebaseStorageError(error);
  }
}
