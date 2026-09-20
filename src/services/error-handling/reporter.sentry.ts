/**
 * Sentry reporter — stub with the correct `ErrorReporter` shape.
 *
 * Behaves as a safe no-op until the Sentry SDK is installed. To enable:
 *
 * 1. `pnpm add @sentry/nextjs`
 * 2. Add Sentry init in `instrumentation.ts` per Sentry docs.
 * 3. Uncomment the `Sentry.*` lines below.
 *
 * `reporter.ts` already selects this reporter when `NODE_ENV !== 'development'`,
 * so no other file needs to change.
 */
// import * as Sentry from '@sentry/nextjs';

import type { ErrorReporter } from "./reporter.types";
import type { ErrorSeverity } from "./types";

function toSentryLevel(level: ErrorSeverity): "debug" | "info" | "warning" | "error" | "fatal" {
  return level === "info" || level === "warning" || level === "error" || level === "fatal"
    ? level
    : "info";
}

export const sentryReporter: ErrorReporter = {
  captureException(_error, _context) {
    // Sentry.captureException(_error, {
    //   tags: _context?.tags,
    //   extra: {
    //     feature: _context?.feature,
    //     action: _context?.action,
    //     ..._context?.extra,
    //   },
    // });
    void _error;
    void _context;
  },

  captureMessage(_message, _level = "info", _context) {
    // Sentry.captureMessage(_message, {
    //   level: toSentryLevel(_level),
    //   tags: _context?.tags,
    //   extra: _context?.extra,
    // });
    void _message;
    void toSentryLevel(_level);
    void _context;
  },

  addBreadcrumb(_breadcrumb) {
    // Sentry.addBreadcrumb({
    //   message: _breadcrumb.message,
    //   category: _breadcrumb.category,
    //   level: _breadcrumb.level ? toSentryLevel(_breadcrumb.level) : undefined,
    //   data: _breadcrumb.data,
    //   timestamp: _breadcrumb.timestamp,
    // });
    void _breadcrumb;
  },

  setUser(_user) {
    // Sentry.setUser(_user);
    void _user;
  },

  clearUser() {
    // Sentry.setUser(null);
  },
};
