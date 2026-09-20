import { consoleReporter } from "./reporter.console";
import { sentryReporter } from "./reporter.sentry";

import type { ErrorReporter } from "./reporter.types";

/**
 * Active error reporter for the entire application.
 *
 * Selection is `NODE_ENV`-based:
 * - `development`  → console (structured local logs)
 * - anything else  → Sentry (safe stub until the SDK is installed)
 *
 * To force a specific reporter, uncomment the manual override below.
 */
function selectReporter(): ErrorReporter {
  // Manual override — uncomment to force one reporter regardless of NODE_ENV.
  // return consoleReporter;
  // return noopReporter;

  if (process.env.NODE_ENV === "development") {
    return consoleReporter;
  }

  return sentryReporter;
}

export const errorReporter: ErrorReporter = selectReporter();
