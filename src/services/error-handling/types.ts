/**
 * Shared types for the error-handling module.
 *
 * Provider-agnostic — no Sentry, Bugsnag, Firebase, or Apollo specifics.
 */

export type ErrorKind = "auth" | "permission" | "network" | "validation" | "api" | "unknown";

export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

/**
 * Contextual metadata attached to a reported error.
 *
 * `feature` + `action` let reporters group events; `tags`/`extra` are free-form.
 */
export type ErrorContext = {
  feature?: string;
  action?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

/** Structured breadcrumb — a small event added to the trail leading up to an error. */
export type Breadcrumb = {
  message: string;
  category?: string;
  level?: ErrorSeverity;
  data?: Record<string, unknown>;
  timestamp?: number;
};

/** Minimal user identity attached to error reports. */
export type ReporterUser = {
  id: string;
  email?: string;
  username?: string;
};

/** Delivery channel — where a normalized error is routed. */
export type Channel = "toast" | "report";
