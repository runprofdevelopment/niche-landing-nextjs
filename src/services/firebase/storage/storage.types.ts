/**
 * Reference to a file stored in backend-managed Firebase Storage.
 */
export type StorageFileReference = {
  path: string;
  bucket?: string;
};

export type UploadFileMetadata = {
  contentType?: string;
};

/**
 * Options for uploading a file through the backend storage API.
 */
export type UploadFileOptions = {
  path: string;
  file: Blob | Uint8Array | ArrayBuffer;
  metadata?: UploadFileMetadata;
  fileName?: string;
  onProgress?: (progress: number) => void;
  /** Skip the signed-in-user requirement for genuinely public upload flows. */
  allowAnonymous?: boolean;
};

export type ReplaceFileOptions = UploadFileOptions & {
  existingFilePath: string;
};

/**
 * Result of a successful upload operation.
 */
export type UploadFileResult = StorageFileReference & {
  downloadUrl: string;
  contentType: string;
  size: number;
};

/**
 * Result of a successful download operation.
 */
export type DownloadFileResult = {
  path: string;
  blob: Blob;
};
