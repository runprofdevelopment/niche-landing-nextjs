import { graphqlEndpoint } from "@/config/apollo";
import { getAuthorizationHeader } from "@/lib/auth/request-auth";
import { AppError } from "@/services/error-handling";

import type { StorageFileReference } from "./storage.types";

type FileResponseDto = {
  file_path: string;
  file_url: string;
  content_type: string;
  size: number;
};

type FileLinkResponseDto = {
  file_path: string;
  file_url: string;
};

function buildStorageUrl() {
  const url = new URL(graphqlEndpoint);
  url.pathname = "/storage";
  url.search = "";
  return url.toString();
}

/**
 * Extracts the storage object path from a Firebase Storage download URL
 * (`https://.../o/<encoded-path>?alt=media&token=...`). Returns `null` for
 * anything that isn't such a URL.
 */
function extractStorageObjectPath(value: string): string | null {
  if (!/^https?:\/\//i.test(value)) return null;

  try {
    const { pathname } = new URL(value);
    const [, encodedPath] = /\/o\/([^/]+)$/.exec(pathname) ?? [];
    return encodedPath ? decodeURIComponent(encodedPath) : null;
  } catch {
    return null;
  }
}

export function toStoragePath(reference: StorageFileReference) {
  const path = extractStorageObjectPath(reference.path) ?? reference.path;
  const normalizedPath = path.replace(/^\/+/, "");
  return reference.bucket ? `gs://${reference.bucket}/${normalizedPath}` : normalizedPath;
}

/**
 * The backend `/storage` endpoint itself accepts anonymous requests (verified
 * live) — this guard exists so authenticated features fail loudly if a session
 * is unexpectedly missing. Pass `{ required: false }` for genuinely public
 * flows (e.g. the unauthenticated `/apply` page): this never attaches a token,
 * even if one happens to exist (e.g. a stray dashboard session in the same
 * browser) — the backend applies role/permission-scoped path checks to
 * authenticated requests that a public flow's paths won't pass.
 */
export async function createStorageAuthHeaders(
  options: { required?: boolean } = {},
): Promise<Record<string, string>> {
  const { required = true } = options;
  if (!required) return {};

  const authorization = await getAuthorizationHeader();
  if (!authorization) {
    throw new AppError("Authentication is required to use file storage.", {
      kind: "auth",
      messageKey: "generic.auth",
    });
  }

  return { authorization };
}

export function parseStorageErrorMessage(
  status: number,
  fallbackMessage: string,
  rawMessage?: string,
) {
  const message = rawMessage?.trim();
  const kind = status === 401 || status === 403 ? "auth" : "api";
  const messageKey = kind === "auth" ? "generic.auth" : "generic.api";

  return new AppError(message || fallbackMessage, { kind, messageKey });
}

export async function resolveStorageFileLink(
  reference: StorageFileReference,
): Promise<FileLinkResponseDto> {
  const url = new URL(buildStorageUrl());
  url.searchParams.set("file_path", toStoragePath(reference));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await createStorageAuthHeaders(),
  });

  if (!response.ok) {
    let message: string | undefined;
    try {
      message = ((await response.json()) as { message?: string }).message;
    } catch {}

    throw parseStorageErrorMessage(response.status, "Failed to resolve file URL.", message);
  }

  return (await response.json()) as FileLinkResponseDto;
}

export { buildStorageUrl };
export type { FileLinkResponseDto, FileResponseDto };
