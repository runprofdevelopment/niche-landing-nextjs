/* eslint-disable no-console --
 * The console reporter is the sanctioned surface for `console.*` calls.
 * All other application code must go through `handleError` or a reporter.
 */
import { serializeError } from "./utils/serialize-error";

import type { ErrorReporter } from "./reporter.types";
import type { ErrorSeverity } from "./types";

const PREFIX = "[error-handling]";

function readableMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();

  const serialized = serializeError(error);
  const serializedMessage = serialized["message"];
  if (typeof serializedMessage === "string" && serializedMessage.trim()) {
    return serializedMessage.trim();
  }

  return "Unknown error";
}

/**
 * Console reporter — used only in local development.
 *
 * Logs structured payloads via `console.error`/`warn`/`info`/`debug`. Never
 * enabled in staging/production — `reporter.ts` selects `sentryReporter` there.
 */
export const consoleReporter: ErrorReporter = {
  captureException(error, context) {
    const message = readableMessage(error);
    // Lead with the backend/readable message so DevTools is scannable.
    console.error(`${PREFIX} ${message}`, {
      error: serializeError(error),
      context: context ?? {},
    });
  },

  captureMessage(message, level: ErrorSeverity = "info", context) {
    const label = `${PREFIX} [${level}] ${message}`;

    switch (level) {
      case "fatal":
      case "error":
        console.error(label, context ?? {});
        break;
      case "warning":
        console.warn(label, context ?? {});
        break;
      case "info":
      default:
        console.info(label, context ?? {});
        break;
    }
  },

  addBreadcrumb(breadcrumb) {
    console.debug(PREFIX, "breadcrumb", breadcrumb);
  },

  setUser(user) {
    console.debug(PREFIX, "setUser", user);
  },

  clearUser() {
    console.debug(PREFIX, "clearUser");
  },
};
