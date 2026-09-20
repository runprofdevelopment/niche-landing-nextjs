import type { ErrorContext, ErrorKind, ErrorSeverity } from "./types";

export type AppErrorOptions = {
  /** Which family the error belongs to — drives delivery rules and generic messages. */
  kind?: ErrorKind;
  /** Stable machine-readable code, e.g. `auth/wrong-password` or `unknown`. */
  code?: string;
  /** i18n message key path under the `errors` namespace. */
  messageKey?: string;
  /** Reporter severity level. */
  severity?: ErrorSeverity;
  /** Original thrown value. */
  cause?: unknown;
  /** Structured context for reporters. */
  context?: ErrorContext;
};

/**
 * Normalized application error.
 *
 * All errors flowing through the pipeline are turned into an `AppError` by
 * `detectError`. `messageKey` points at a leaf inside the `errors` locale
 * namespace so the delivery layer can show a translated toast.
 */
export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;
  readonly messageKey: string;
  readonly severity: ErrorSeverity;
  override readonly cause?: unknown;
  readonly context?: ErrorContext;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.kind = options.kind ?? "unknown";
    this.code = options.code ?? this.kind;
    this.messageKey = options.messageKey ?? `generic.${this.kind}`;
    this.severity = options.severity ?? (this.kind === "unknown" ? "error" : "warning");
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
    if (options.context !== undefined) {
      this.context = options.context;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isAppError(value: unknown): value is AppError {
    return value instanceof AppError;
  }
}
