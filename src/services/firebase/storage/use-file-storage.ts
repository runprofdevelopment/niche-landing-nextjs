"use client";

/**
 * useFileStorage — global entry point for uploading, replacing, deleting, and
 * resolving files against the backend `/storage` endpoint.
 *
 * Paths are always derived through `buildStoragePath` (see `./paths`), so
 * features only need to pick a `module` + `folder` and pass the `File`.
 *
 * Every operation reports failures through `useErrorHandler` as a toast, and
 * fires a localized success toast (`common.entity*Message`) on success. Pass
 * `entityLabel` to override the default `common.file` label ("Logo", "Avatar"…)
 * or `showSuccessToast: false` to silence the confirmation.
 * All operations return `null` / `false` instead of throwing so form flows can
 * bail out cleanly.
 */

import { useCallback, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { notify } from "@/shared/components";

import { deleteFile } from "./delete";
import { getDownloadURL } from "./download";
import { buildStoragePath, type StorageFolder, type StorageModule } from "./paths";
import { replaceFile } from "./replace";
import { uploadFile } from "./upload";

import type { UploadFileResult } from "./storage.types";

type StorageTargetInput<M extends StorageModule> = {
  module: M;
  folder: StorageFolder<M>;
  file: File;
};

type UseFileStorageOptions = {
  /** Error-handling `feature` tag. Defaults to `'storage'`. */
  errorFeature?: string;
  /**
   * Localized entity label used in success toasts (e.g. "Logo", "Profile photo").
   * Falls back to the translated `common.file` label.
   */
  entityLabel?: string;
  /** Set to `false` to silence success toasts. Defaults to `true`. */
  showSuccessToast?: boolean;
  /** Skip the signed-in-user requirement for genuinely public upload flows. */
  allowAnonymous?: boolean;
};

function useFileStorage(options: UseFileStorageOptions = {}) {
  const { handleError } = useErrorHandler();
  const tCommon = useTranslations("common");
  const feature = options.errorFeature ?? "storage";
  const entityLabel = options.entityLabel ?? tCommon("file");
  const shouldNotifySuccess = options.showSuccessToast ?? true;
  const allowAnonymous = options.allowAnonymous ?? false;

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [removing, setRemoving] = useState(false);

  const upload = useCallback(
    async <M extends StorageModule>(
      input: StorageTargetInput<M>,
    ): Promise<UploadFileResult | null> => {
      setUploading(true);
      setProgress(0);
      try {
        const result = await uploadFile({
          path: buildStoragePath({ module: input.module, folder: input.folder }),
          file: input.file,
          fileName: input.file.name,
          onProgress: setProgress,
          allowAnonymous,
        });
        if (shouldNotifySuccess) {
          notify.success({
            title: tCommon("entityUploadedMessage", { entity: entityLabel }),
          });
        }
        return result;
      } catch (error) {
        handleError(error, {
          context: {
            feature,
            action: "UploadFile",
            extra: { module: input.module, folder: input.folder as string },
          },
          channels: ["toast"],
        });
        return null;
      } finally {
        setUploading(false);
      }
    },
    [feature, handleError, entityLabel, shouldNotifySuccess, tCommon, allowAnonymous],
  );

  const replace = useCallback(
    async <M extends StorageModule>(
      input: StorageTargetInput<M> & { existingPath: string },
    ): Promise<UploadFileResult | null> => {
      setReplacing(true);
      setProgress(0);
      try {
        const result = await replaceFile({
          existingFilePath: input.existingPath,
          path: buildStoragePath({ module: input.module, folder: input.folder }),
          file: input.file,
          fileName: input.file.name,
          onProgress: setProgress,
          allowAnonymous,
        });
        if (shouldNotifySuccess) {
          notify.success({
            title: tCommon("entityReplacedMessage", { entity: entityLabel }),
          });
        }
        return result;
      } catch (error) {
        handleError(error, {
          context: {
            feature,
            action: "ReplaceFile",
            extra: { module: input.module, folder: input.folder as string },
          },
          channels: ["toast"],
        });
        return null;
      } finally {
        setReplacing(false);
      }
    },
    [feature, handleError, entityLabel, shouldNotifySuccess, tCommon, allowAnonymous],
  );

  const remove = useCallback(
    async (path: string): Promise<boolean> => {
      if (!path) return false;
      setRemoving(true);
      try {
        await deleteFile({ path });
        if (shouldNotifySuccess) {
          notify.success({
            title: tCommon("entityDeletedMessage", { entity: entityLabel }),
          });
        }
        return true;
      } catch (error) {
        handleError(error, {
          context: { feature, action: "DeleteFile", extra: { path } },
          channels: ["toast"],
        });
        return false;
      } finally {
        setRemoving(false);
      }
    },
    [feature, handleError, entityLabel, shouldNotifySuccess, tCommon],
  );

  const resolveUrl = useCallback(
    async (path: string): Promise<string | null> => {
      if (!path) return null;
      try {
        return await getDownloadURL({ path });
      } catch (error) {
        handleError(error, {
          context: { feature, action: "ResolveFileUrl", extra: { path } },
          channels: ["toast"],
        });
        return null;
      }
    },
    [feature, handleError],
  );

  return {
    upload,
    replace,
    remove,
    resolveUrl,
    progress,
    uploading,
    replacing,
    removing,
    busy: uploading || replacing || removing,
  };
}

export { useFileStorage };
export type { StorageTargetInput, UseFileStorageOptions };
