import { graphqlEndpoint } from "@/config/apollo";
import { getAuthorizationHeader } from "@/lib/auth/request-auth";
import { AppError } from "@/services/error-handling";
import { MultipartUploadError, uploadMultipartFile } from "@/shared/utils/upload-multipart-file";

export type UploadUrlType = "display" | "download";

export type UploadedInvitationFile = {
  id: string;
  name: string;
  privateUrl: string;
  publicUrl: string;
  sizeInBytes: number;
  urlType: UploadUrlType | string;
};

type UploadInvitationImageResponse = {
  files?: UploadedInvitationFile[];
};

/** Default storage folder for invitation images. */
export const INVITATION_UPLOAD_DESTINATION = "images/events/invitations";

/**
 * POST multipart image to the API `/upload` endpoint (same host as GraphQL).
 * Form fields: `file`, `destination` (folder), `urlType` (`display` | `download`).
 */
export function buildInvitationUploadUrl(): string {
  const url = new URL(graphqlEndpoint);
  url.pathname = "/upload";
  url.search = "";
  return url.toString();
}

function extractUploadedFile(payload: unknown): UploadedInvitationFile | null {
  if (!payload || typeof payload !== "object") return null;

  const files = (payload as UploadInvitationImageResponse).files;
  const first = Array.isArray(files) ? files[0] : undefined;
  if (!first?.publicUrl?.trim()) return null;

  return {
    id: first.id,
    name: first.name,
    privateUrl: first.privateUrl,
    publicUrl: first.publicUrl.trim(),
    sizeInBytes: first.sizeInBytes,
    urlType: first.urlType,
  };
}

/** Uploads an invitation image and returns the durable `publicUrl` for preview + HTML. */
export async function uploadInvitationImage(
  file: File,
  options: {
    destination?: string;
    urlType?: UploadUrlType;
  } = {},
): Promise<string> {
  const uploaded = await uploadInvitationImageFile(file, options);
  return uploaded.publicUrl;
}

/**
 * Only http(s) Firebase / CDN URLs are safe to persist.
 * Rejects ephemeral `blob:` / `data:` preview URLs that must never be saved.
 */
export function resolveInvitationImageUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return null;
  return trimmed;
}

/** Uploads an invitation image and returns the full file metadata from `/upload`. */
export async function uploadInvitationImageFile(
  file: File,
  options: {
    destination?: string;
    urlType?: UploadUrlType;
  } = {},
): Promise<UploadedInvitationFile> {
  const destination = options.destination ?? INVITATION_UPLOAD_DESTINATION;
  const urlType = options.urlType ?? "display";

  const authorization = await getAuthorizationHeader();
  if (!authorization) {
    throw new AppError("Authentication is required to upload invitation images.", {
      kind: "auth",
      messageKey: "generic.auth",
    });
  }

  try {
    const payload = await uploadMultipartFile<UploadInvitationImageResponse>({
      url: buildInvitationUploadUrl(),
      file,
      fileFieldName: "file",
      fileName: file.name || "invitation-image.png",
      fields: {
        destination,
        urlType,
      },
      headers: { authorization },
    });

    const uploaded = extractUploadedFile(payload);
    if (!uploaded) {
      throw new AppError("Upload succeeded but no publicUrl was returned.", {
        kind: "api",
        messageKey: "generic.api",
      });
    }

    return uploaded;
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof MultipartUploadError) {
      let message: string | undefined;
      try {
        message = (JSON.parse(error.responseText) as { message?: string }).message;
      } catch {
        message = error.responseText || undefined;
      }

      throw new AppError(message?.trim() || "Image upload failed.", {
        kind: error.status === 401 || error.status === 403 ? "auth" : "api",
        messageKey: error.status === 401 || error.status === 403 ? "generic.auth" : "generic.api",
      });
    }

    throw error;
  }
}
