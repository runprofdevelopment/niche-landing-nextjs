export const FEATURE_NAMESPACES = [
  "common",
  "dashboard",
  "dataTable",
  "errors",
  "events",
  "meta",
  "navigation",
  "requests",
] as const;

export type FeatureNamespace = (typeof FEATURE_NAMESPACES)[number];
