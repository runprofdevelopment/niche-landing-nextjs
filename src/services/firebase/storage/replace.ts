import { MultipartUploadError, uploadMultipartFile } from "@/shared/utils/upload-multipart-file";

import {
  buildStorageUrl,
  createStorageAuthHeaders,
  parseStorageErrorMessage,
  toStoragePath,
  type FileResponseDto,
} from "./backend-storage";
import { mapFirebaseStorageError } from "./storage.errors";

import type { ReplaceFileOptions, UploadFileResult } from "./storage.types";

/**
 * Replaces an existing file through the backend `PUT /storage` endpoint.
 */
export async function replaceFile(options: ReplaceFileOptions): Promise<UploadFileResult> {
  try {
    const data = await uploadMultipartFile<FileResponseDto>({
      url: buildStorageUrl(),
      method: "PUT",
      file: options.file,
      fileFieldName: "file",
      fileName: options.fileName ?? "upload.bin",
      fields: {
        existing_file_path: toStoragePath({ path: options.existingFilePath }),
        file_path: options.path,
      },
      headers: await createStorageAuthHeaders({ required: !options.allowAnonymous }),
      onProgress: options.onProgress,
    });

    return {
      path: data.file_path,
      downloadUrl: data.file_url,
      contentType: data.content_type,
      size: data.size,
    };
  } catch (error) {
    if (error instanceof MultipartUploadError) {
      try {
        const payload = JSON.parse(error.responseText) as { message?: string };
        throw parseStorageErrorMessage(error.status, "File replacement failed.", payload.message);
      } catch {}

      throw parseStorageErrorMessage(error.status, "File replacement failed.", error.responseText);
    }

    throw mapFirebaseStorageError(error);
  }
}
