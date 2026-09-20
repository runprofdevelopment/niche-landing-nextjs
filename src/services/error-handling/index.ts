/**
 * Error-handling module — minimal 2-layer surface.
 *
 * Layer 1 — Detect: `detectError` normalizes any raw value into `AppError`.
 * Layer 2 — Deliver: `useErrorHandler` (client) or `errorReporter` (anywhere)
 * routes the AppError to a localized toast and/or the active reporter.
 *
 * Reporter selection lives in `reporter.ts` — console in local dev, Sentry
 * (safe stub until installed) elsewhere.
 */

export { AppError, type AppErrorOptions } from "./app-error";
export { detectError } from "./detect";
export { deliverAppError, detectAndDeliver, type DeliverOptions } from "./deliver";
export { useErrorHandler, type UseErrorHandlerResult } from "./use-error-handler";
export { handleGraphQLMutationError } from "./handle-graphql-mutation-error";

export { errorReporter } from "./reporter";
export { consoleReporter } from "./reporter.console";
export { noopReporter } from "./reporter.noop";
export { sentryReporter } from "./reporter.sentry";
export type { ErrorReporter } from "./reporter.types";

export { DEFAULT_CHANNELS } from "./delivery-rules";
export { FIREBASE_CODE_MAP, isFirebaseError, type FirebaseErrorShape } from "./firebase-codes";

export { toError } from "./utils/to-error";
export { serializeError } from "./utils/serialize-error";

export type {
  Breadcrumb,
  Channel,
  ErrorContext,
  ErrorKind,
  ErrorSeverity,
  ReporterUser,
} from "./types";
