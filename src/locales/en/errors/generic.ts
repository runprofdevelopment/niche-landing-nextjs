/**
 * Generic per-kind fallback messages in English.
 *
 * Used when a more specific message (e.g. Firebase code) is not available.
 */
const generic = {
  auth: "Authentication failed. Please try again.",
  permission: "You do not have permission to do that.",
  network: "Network problem. Check your connection.",
  validation: "Please check your input and try again.",
  api: "The server could not complete your request. Please try again.",
  unknown: "Something went wrong. Please try again.",
} as const;

export default generic;
