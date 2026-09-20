"use client";

import { useCallback, useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";

import { detectAndDeliver, type DeliverOptions } from "./deliver";

import type { AppError } from "./app-error";

type ErrorTranslator = (key: string) => string;

/**
 * Client-side error handler.
 *
 * Returns a `handleError` function that detects + delivers in one call:
 *   - detects the raw error and normalizes it to `AppError`
 *   - shows a localized toast when the delivery rules include `'toast'`
 *   - reports to `errorReporter` when the rules include `'report'`
 *
 * @example
 * ```tsx
 * const { handleError } = useErrorHandler();
 * try { await signIn(email, password); }
 * catch (error) { handleError(error, { context: { feature: 'auth', action: 'signIn' } }); }
 * ```
 */
export function useErrorHandler() {
  const t = useTranslations("errors");

  // next-intl accepts any string key at runtime — cast so nested paths like
  // `firebase.auth/wrong-password` and `generic.<kind>` are usable here.
  const translate = useCallback<ErrorTranslator>(
    (key: string) => (t as unknown as ErrorTranslator)(key),
    [t],
  );

  const handleError = useCallback(
    (error: unknown, options?: DeliverOptions): AppError =>
      detectAndDeliver(error, translate, options),
    [translate],
  );

  return useMemo(() => ({ handleError }), [handleError]);
}

export type UseErrorHandlerResult = ReturnType<typeof useErrorHandler>;
