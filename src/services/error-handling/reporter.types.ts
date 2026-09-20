import type { Breadcrumb, ErrorContext, ErrorSeverity, ReporterUser } from "./types";

/**
 * Provider-agnostic error reporter contract.
 *
 * Application code depends on this interface — never on a concrete provider.
 * Swap implementations in `reporter.ts` without touching call sites.
 */
export interface ErrorReporter {
  captureException(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level?: ErrorSeverity, context?: ErrorContext): void;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  setUser(user: ReporterUser | null): void;
  clearUser(): void;
}
