/**
 * Serializes an error (and its `cause` chain) into a plain, log-friendly object.
 *
 * Handles cyclic references via a visited set. Used by reporters that need
 * structured payloads (Console, future Sentry/Bugsnag).
 */
export function serializeError(error: unknown): Record<string, unknown> {
  const seen = new WeakSet<object>();
  return serialize(error, seen);
}

function serialize(value: unknown, seen: WeakSet<object>): Record<string, unknown> {
  if (value === null || value === undefined) {
    return { value: String(value) };
  }

  if (typeof value !== "object") {
    return { value };
  }

  if (seen.has(value as object)) {
    return { value: "[Circular]" };
  }

  seen.add(value as object);

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  if (typeof source["name"] === "string") result["name"] = source["name"];
  if (typeof source["message"] === "string") result["message"] = source["message"];
  if (typeof source["stack"] === "string") result["stack"] = source["stack"];
  if (source["code"] !== undefined) result["code"] = source["code"];
  if (source["context"] !== undefined) result["context"] = source["context"];

  if (source["cause"] !== undefined) {
    result["cause"] = serialize(source["cause"], seen);
  }

  return result;
}
