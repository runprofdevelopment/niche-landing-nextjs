import { MultipartUploadError, uploadMultipartFile } from "@/shared/utils/upload-multipart-file";

import {
  buildStorageUrl,
  createStorageAuthHeaders,
  parseStorageErrorMessage,
  type FileResponseDto,
} from "./backend-storage";
import { mapFirebaseStorageError } from "./storage.errors";

import type { UploadFileOptions, UploadFileResult } from "./storage.types";

/**
 * Uploads a file through the backend `/storage` endpoint.
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  try {
    const data = await uploadMultipartFile<FileResponseDto>({
      url: buildStorageUrl(),
      file: options.file,
      fileFieldName: "file",
      fileName: options.fileName ?? "upload.bin",
      fields: {
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
        throw parseStorageErrorMessage(error.status, "File upload failed.", payload.message);
      } catch {}

      throw parseStorageErrorMessage(error.status, "File upload failed.", error.responseText);
    }

    throw mapFirebaseStorageError(error);
  }
}
