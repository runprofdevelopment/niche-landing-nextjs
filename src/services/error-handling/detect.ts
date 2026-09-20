import { AppError } from "./app-error";
import { FIREBASE_CODE_MAP, isFirebaseError, type FirebaseErrorShape } from "./firebase-codes";

import type { ErrorContext, ErrorKind, ErrorSeverity } from "./types";

type NormalizedShape = {
  message: string;
  kind: ErrorKind;
  code: string;
  messageKey: string;
  severity: ErrorSeverity;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Detects Apollo / GraphQL errors by shape (never imports @apollo/client). */
function isGraphQLLikeError(error: unknown): boolean {
  if (!isPlainRecord(error)) return false;
  if (typeof error["name"] === "string" && error["name"].startsWith("Apollo")) return true;
  if (Array.isArray(error["graphQLErrors"])) return true;
  if ("networkError" in error && error["networkError"] != null) return true;
  if (Array.isArray(error["errors"])) return true;
  if (typeof error["statusCode"] === "number" && "response" in error) return true;
  return false;
}

function normalizeFirebase(error: FirebaseErrorShape): NormalizedShape {
  const code = error.code;
  const mapped = FIREBASE_CODE_MAP[code];
  const kind: ErrorKind = mapped?.kind ?? "unknown";
  const severity: ErrorSeverity = mapped?.severity ?? "error";

  return {
    message: typeof error.message === "string" ? error.message : code,
    kind,
    code,
    messageKey: `firebase.${code}`,
    severity,
  };
}

function extractGraphQLMessage(error: Record<string, unknown>): string {
  const messages = collectGraphQLMessages(error);
  const specific = messages.find((message) => !isGenericTransportMessage(message));
  return specific ?? messages[0] ?? "GraphQL error";
}

function isGenericTransportMessage(message: string): boolean {
  return (
    message === "GraphQL error" ||
    /^Response not successful: Received status code \d+$/.test(message)
  );
}

function collectGraphQLMessages(value: unknown, depth = 0): string[] {
  if (depth > 5 || value == null) return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    const parsed = parseJsonRecord(trimmed);
    return parsed ? collectGraphQLMessages(parsed, depth + 1) : [trimmed];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectGraphQLMessages(item, depth + 1));
  }

  if (!isPlainRecord(value)) return [];

  const messages: string[] = [];
  if (typeof value["message"] === "string") {
    messages.push(...collectGraphQLMessages(value["message"], depth + 1));
  }
  messages.push(...collectGraphQLMessages(value["errors"], depth + 1));
  messages.push(...collectGraphQLMessages(value["graphQLErrors"], depth + 1));

  const networkError = value["networkError"];
  if (isPlainRecord(networkError)) {
    messages.push(...collectGraphQLMessages(networkError["result"], depth + 1));
    messages.push(...collectGraphQLMessages(networkError["bodyText"], depth + 1));
  }

  if ("cause" in value) {
    messages.push(...collectGraphQLMessages(value["cause"], depth + 1));
  }

  return messages;
}

function parseJsonRecord(value: string): Record<string, unknown> | null {
  if (!value.startsWith("{") && !value.startsWith("[")) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isPlainRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeGraphQL(error: Record<string, unknown>): NormalizedShape {
  const networkError = error["networkError"];
  const networkStatusCode =
    isPlainRecord(networkError) && typeof networkError["statusCode"] === "number"
      ? networkError["statusCode"]
      : undefined;

  const statusCode =
    typeof error["statusCode"] === "number" ? error["statusCode"] : networkStatusCode;

  const isNetworkFailure =
    (error["networkError"] != null && statusCode === undefined) ||
    error["name"] === "ServerParseError";

  const kind: ErrorKind =
    statusCode === 401
      ? "auth"
      : statusCode === 403
        ? "permission"
        : isNetworkFailure
          ? "network"
          : "api";

  const severity: ErrorSeverity = kind === "auth" || kind === "permission" ? "warning" : "error";
  const code = statusCode ? `api/${statusCode}` : `graphql/${kind}`;

  return {
    message: extractGraphQLMessage(error),
    kind,
    code,
    messageKey: `generic.${kind}`,
    severity,
  };
}

function normalizeGeneric(error: unknown): NormalizedShape {
  if (error instanceof Error) {
    return {
      message: error.message || "Error",
      kind: "unknown",
      code: "unknown",
      messageKey: "generic.unknown",
      severity: "error",
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error",
    kind: "unknown",
    code: "unknown",
    messageKey: "generic.unknown",
    severity: "error",
  };
}

/**
 * Detect + normalize any raw thrown value into an `AppError`.
 *
 * Pure — no side effects, safe to call from server components, edge runtimes,
 * or React render. Preserves an already-normalized `AppError` untouched.
 */
export function detectError(error: unknown, context?: ErrorContext): AppError {
  if (AppError.isAppError(error)) {
    return error;
  }

  const shape: NormalizedShape = isFirebaseError(error)
    ? normalizeFirebase(error)
    : isGraphQLLikeError(error)
      ? normalizeGraphQL(error as Record<string, unknown>)
      : normalizeGeneric(error);

  return new AppError(shape.message, {
    kind: shape.kind,
    code: shape.code,
    messageKey: shape.messageKey,
    severity: shape.severity,
    cause: error,
    ...(context ? { context } : {}),
  });
}
