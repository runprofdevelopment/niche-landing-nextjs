export class MultipartUploadError extends Error {
  readonly status: number;
  readonly responseText: string;

  constructor(status: number, responseText: string) {
    super(`Upload failed with status ${status}`);
    this.name = "MultipartUploadError";
    this.status = status;
    this.responseText = responseText;
  }
}

type UploadableBody = File | Blob | Uint8Array | ArrayBuffer;

type UploadMultipartFileOptions = {
  url: string;
  file: UploadableBody;
  fileFieldName: string;
  fileName: string;
  fields?: Record<string, string>;
  headers?: Record<string, string>;
  method?: "POST" | "PUT";
  onProgress?: ((progress: number) => void) | undefined;
};

function toBlob(file: UploadableBody): Blob {
  if (file instanceof Blob) return file;
  if (file instanceof ArrayBuffer) return new Blob([file]);
  const copy = new Uint8Array(file.byteLength);
  copy.set(file);
  return new Blob([copy.buffer]);
}

/**
 * Uploads a file as `multipart/form-data` via XHR so upload progress is available.
 */
export function uploadMultipartFile<T>({
  url,
  file,
  fileFieldName,
  fileName,
  fields = {},
  headers = {},
  method = "POST",
  onProgress,
}: UploadMultipartFileOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
    formData.append(fileFieldName, toBlob(file), fileName);

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as T);
        } catch (error) {
          reject(error);
        }
        return;
      }

      reject(new MultipartUploadError(xhr.status, xhr.responseText || ""));
    };

    xhr.onerror = () => {
      reject(new MultipartUploadError(0, xhr.responseText || "Network error"));
    };

    xhr.send(formData);
  });
}
