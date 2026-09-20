import type { FeatureNamespace } from "./registry";

export type Messages = Record<FeatureNamespace, Record<string, unknown>>;

export function composeMessages<T extends Messages>(messages: T): T {
  const keys = Object.keys(messages) as FeatureNamespace[];
  for (const key of keys) {
    if (!messages[key] || typeof messages[key] !== "object") {
      throw new Error(`Missing locale namespace: ${key}`);
    }
  }
  return messages;
}
