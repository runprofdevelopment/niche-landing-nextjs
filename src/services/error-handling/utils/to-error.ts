/**
 * Normalizes any thrown value into an `Error` instance.
 *
 * Preserves the message when possible; falls back to `String(value)` for exotic values.
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === "string") {
    return new Error(value);
  }

  if (value === null || value === undefined) {
    return new Error(String(value));
  }

  if (typeof value === "object") {
    try {
      return new Error(JSON.stringify(value));
    } catch {
      return new Error(String(value));
    }
  }

  return new Error(String(value));
}
