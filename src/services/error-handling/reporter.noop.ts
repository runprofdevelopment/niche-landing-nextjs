import type { ErrorReporter } from "./reporter.types";

/**
 * Silent reporter — no-op for every method.
 *
 * Useful for tests, SSR, or any environment where dropping error events is desired.
 */
export const noopReporter: ErrorReporter = {
  captureException: () => undefined,
  captureMessage: () => undefined,
  addBreadcrumb: () => undefined,
  setUser: () => undefined,
  clearUser: () => undefined,
};
