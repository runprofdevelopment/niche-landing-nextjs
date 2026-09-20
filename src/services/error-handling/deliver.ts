import { notify } from "@/shared/components/feedback/toast";

import { DEFAULT_CHANNELS } from "./delivery-rules";
import { detectError } from "./detect";
import { errorReporter } from "./reporter";

import type { AppError } from "./app-error";
import type { Channel, ErrorContext } from "./types";

export type DeliverOptions = {
  /** Override the channels chosen from `DEFAULT_CHANNELS`. */
  channels?: Channel[];
  /** Structured context passed through to the reporter. */
  context?: ErrorContext;
  /** Optional translated title for the toast. Defaults to the localized message. */
  toastTitle?: string;
};

/**
 * Route an already-normalized `AppError` to its default channels.
 *
 * The translator `t` is passed in by callers (client hook or Apollo link) so
 * `deliver.ts` stays framework-agnostic. Server callers pass a stub translator
 * that returns the raw messageKey — reports still fire.
 *
 * @param translate  `(key: string) => string` — usually `useTranslations('errors')`
 *                   from the i18n layer, cast to accept nested key paths.
 */
export function deliverAppError(
  appError: AppError,
  translate: (key: string) => string,
  options: DeliverOptions = {},
): void {
  const channels = options.channels ?? DEFAULT_CHANNELS[appError.kind];
  const context = { ...appError.context, ...options.context };

  if (channels.includes("toast")) {
    const message = translateWithFallback(translate, appError);
    const description = buildToastDescription(translate, appError, message);
    notify.error({
      // Stable per error identity so a duplicate delivery (e.g. React Strict
      // Mode double-invoking an effect in dev) updates the existing toast
      // instead of stacking a second one.
      id: `error:${appError.code}:${context.feature ?? ""}:${context.action ?? ""}`,
      title: options.toastTitle ?? message,
      description: options.toastTitle ? message : description,
    });
  }

  if (channels.includes("report")) {
    errorReporter.captureException(appError, context);
  }
}

/**
 * Detect + deliver in one call.
 *
 * Convenience wrapper used by `useErrorHandler` and the Apollo link.
 */
export function detectAndDeliver(
  error: unknown,
  translate: (key: string) => string,
  options: DeliverOptions = {},
): AppError {
  const appError = detectError(error, options.context);
  deliverAppError(appError, translate, options);
  return appError;
}

function hasBackendMessage(appError: AppError): boolean {
  const message = appError.message.trim();
  if (!message) return false;

  // Placeholder messages from normalize — not real backend copy.
  if (message === "GraphQL error" || message === "Error" || message === "Unknown error") {
    return false;
  }

  if (/^Response not successful: Received status code \d+$/.test(message)) {
    return false;
  }

  return true;
}

function buildToastDescription(
  translate: (key: string) => string,
  appError: AppError,
  title: string,
): string | undefined {
  const technical = [appError.code, appError.message.trim()].filter(Boolean).join(" — ");

  if (!technical || technical === title) {
    return undefined;
  }

  const firebaseDefault = safeTranslate(translate, "firebase.default");
  const genericUnknown = safeTranslate(translate, "generic.unknown");

  if (
    title === firebaseDefault ||
    title === genericUnknown ||
    title === "Something went wrong. Please try again."
  ) {
    return technical;
  }

  if (appError.code !== "unknown" && !title.includes(appError.code)) {
    return technical;
  }

  return undefined;
}

function translateWithFallback(translate: (key: string) => string, appError: AppError): string {
  // API / GraphQL: prefer the server-provided message over generic locale copy.
  if (appError.kind === "api" && hasBackendMessage(appError)) {
    return appError.message;
  }

  const primary = safeTranslate(translate, appError.messageKey);
  if (primary) return primary;

  if (appError.messageKey.startsWith("firebase.")) {
    const firebaseDefault = safeTranslate(translate, "firebase.default");
    if (firebaseDefault) return firebaseDefault;
  }

  if (hasBackendMessage(appError)) {
    return appError.message;
  }

  const generic = safeTranslate(translate, `generic.${appError.kind}`);
  if (generic) return generic;

  return appError.message || "Something went wrong.";
}

function safeTranslate(translate: (key: string) => string, key: string): string | null {
  try {
    const result = translate(key);
    if (typeof result !== "string" || result.length === 0) return null;
    // next-intl returns the raw key when a translation is missing — treat that as "not found".
    if (result === key) return null;
    return result;
  } catch {
    return null;
  }
}
