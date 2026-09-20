import { resolveStorageFileLink } from "./backend-storage";
import { mapFirebaseStorageError } from "./storage.errors";

import type { DownloadFileResult, StorageFileReference } from "./storage.types";

/**
 * Downloads a file from Firebase Storage through the backend link resolver.
 */
export async function downloadFile(reference: StorageFileReference): Promise<DownloadFileResult> {
  try {
    const { file_path, file_url } = await resolveStorageFileLink(reference);
    const response = await fetch(file_url);
    if (!response.ok) {
      throw new Error(`Failed to download file with status ${response.status}.`);
    }
    const blob = await response.blob();

    return {
      path: file_path,
      blob,
    };
  } catch (error) {
    throw mapFirebaseStorageError(error);
  }
}

/**
 * Resolves a public download URL for a storage object.
 */
export async function getDownloadURL(reference: StorageFileReference): Promise<string> {
  try {
    const { file_url } = await resolveStorageFileLink(reference);
    return file_url;
  } catch (error) {
    throw mapFirebaseStorageError(error);
  }
}
