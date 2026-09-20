/**
 * Firebase Storage service.
 */

export { deleteFile } from "./delete";
export { downloadFile, getDownloadURL } from "./download";
export {
  buildStoragePath,
  STORAGE_MODULES,
  STORAGE_ROOT,
  type BuildStoragePathInput,
  type StorageFolder,
  type StorageModule,
} from "./paths";
export { replaceFile } from "./replace";
export {
  FirebaseStorageNotImplementedError,
  firebaseStorageErrorCodes,
  getFirebaseStorageErrorMessage,
  mapFirebaseStorageError,
  type FirebaseStorageErrorCode,
} from "./storage.errors";
export { getFirebaseStorage, resetFirebaseStorageCache } from "./storage.service";
export type {
  DownloadFileResult,
  ReplaceFileOptions,
  StorageFileReference,
  UploadFileOptions,
  UploadFileResult,
} from "./storage.types";
export { uploadFile } from "./upload";
export {
  useFileStorage,
  type StorageTargetInput,
  type UseFileStorageOptions,
} from "./use-file-storage";
