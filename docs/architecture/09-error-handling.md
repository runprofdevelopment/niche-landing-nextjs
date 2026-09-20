# 09 — Error Handling

The error-handling module is deliberately small: **two layers**, one entry point per usage site, and a swappable reporter that changes in one line.

- **Detect** — turn any raw thrown value into a normalized `AppError`.
- **Deliver** — route the `AppError` to a localized toast, an error reporter, or both.

No processor registry, no resolver, no cross-file wiring. If a rule needs to change, you edit a single map.

---

## Architecture at a glance

```
raw error ──► detectError() ──► AppError ──► deliverError()
                                    │              │
                                    │              ├──► notify.error(t(messageKey))   (toast)
                                    │              │
                                    │              └──► errorReporter.captureException  (report)
                                    │                       │
                                    │                       ├──► console (development)
                                    │                       └──► Sentry stub (production/staging)
                                    │
                                    └──► AppError { kind, code, messageKey, severity, cause, context }
```

The two entry points application code should ever import are:

| Usage site                            | Import                                        |
| ------------------------------------- | --------------------------------------------- |
| Client components / hooks (UI)        | `useErrorHandler()` — detect + toast + report |
| Server / edge / Apollo link / workers | `detectError()` + `errorReporter`             |

Anything else in the module is an implementation detail.

---

## Files

```
src/services/error-handling/
├── index.ts                # public API
├── app-error.ts            # AppError class + ErrorKind + ErrorSeverity
├── detect.ts               # detectError(unknown, context?) -> AppError
├── deliver.ts              # deliverAppError() + detectAndDeliver()
├── use-error-handler.ts    # useErrorHandler() client hook
├── firebase-codes.ts       # Firebase code -> { kind, severity } + isFirebaseError()
├── delivery-rules.ts       # ErrorKind -> Channel[]
├── reporter.ts             # SWAP POINT: env-aware reporter selection
├── reporter.types.ts       # ErrorReporter interface
├── reporter.console.ts     # console reporter (local dev)
├── reporter.sentry.ts      # Sentry stub — ready to enable
├── reporter.noop.ts        # silent reporter (tests / SSR opt-out)
├── types.ts                # ErrorContext, Breadcrumb, ReporterUser, Channel, ErrorKind, ErrorSeverity
└── utils/
    ├── to-error.ts
    └── serialize-error.ts
```

---

## The `AppError` shape

```ts
type ErrorKind = "auth" | "permission" | "network" | "validation" | "api" | "unknown";
type ErrorSeverity = "info" | "warning" | "error" | "fatal";

class AppError extends Error {
  readonly kind: ErrorKind;
  readonly code: string; // e.g. 'auth/wrong-password'
  readonly messageKey: string; // e.g. 'firebase.auth/wrong-password' (under the `errors` namespace)
  readonly severity: ErrorSeverity;
  readonly cause?: unknown;
  readonly context?: ErrorContext;

  static isAppError(value: unknown): value is AppError;
}
```

The `messageKey` always resolves under the `errors` locale namespace. Delivery
tries the specific key first, then a fallback chain (see below).

---

## Detect — turning raw errors into `AppError`

`detectError()` inspects the value in this order:

1. Already an `AppError` — returned untouched.
2. Firebase-shaped (`{ code: '<product>/<slug>' }`) — mapped via `FIREBASE_CODE_MAP`. `messageKey = 'firebase.' + code`.
3. GraphQL / Apollo-shaped (`graphQLErrors`, `networkError`, `errors[]`, `statusCode`) — categorized into `auth` (401), `permission` (403), `network` (transport failure), or `api`. `messageKey = 'generic.' + kind`.
4. Anything else — `AppError { kind: 'unknown', code: 'unknown', messageKey: 'generic.unknown' }`.

The detector is duck-typed on purpose — it never imports `firebase/*` or `@apollo/client`, so bundle size and coupling stay tiny.

To add a new Firebase code, add one row to `firebase-codes.ts` and one translation entry in `locales/{en,ar}/errors/firebase.ts`.

---

## Deliver — routing an `AppError`

Every kind maps to one or more channels in `delivery-rules.ts`:

```ts
export const DEFAULT_CHANNELS: Record<ErrorKind, Channel[]> = {
  auth: ["toast"], // user's fault, don't page ops
  permission: ["toast"],
  validation: ["toast"],
  network: ["toast", "report"],
  api: ["toast", "report"],
  unknown: ["toast", "report"], // always page us on unknowns
};
```

A caller can override with `handleError(err, { channels: ['report'] })` (silent) or `['toast']` (no reporter).

### Toast lookup fallback

`deliverAppError` tries three keys under the `errors` namespace, in order:

1. `appError.messageKey` — e.g. `firebase.auth/wrong-password`
2. `firebase.default` — only when the key was Firebase-scoped
3. `generic.<kind>` — e.g. `generic.auth`

If all three are missing, it uses `appError.message` (raw) so the user never sees an empty toast.

---

## Reporter — swappable in one line

`reporter.ts` picks a reporter based on `NODE_ENV`:

```ts
function selectReporter(): ErrorReporter {
  // Manual override — uncomment to force one reporter.
  // return consoleReporter;
  // return noopReporter;

  if (process.env.NODE_ENV === "development") {
    return consoleReporter;
  }
  return sentryReporter;
}

export const errorReporter: ErrorReporter = selectReporter();
```

| Environment                                        | Reporter selected                |
| -------------------------------------------------- | -------------------------------- |
| `pnpm dev` (`NODE_ENV=development`)                | `consoleReporter`                |
| `pnpm build` / `pnpm start` / `pnpm build:staging` | `sentryReporter`                 |
| Tests / SSR opt-out                                | `noopReporter` (manual override) |

### Enabling real Sentry later

1. `pnpm add @sentry/nextjs`
2. Add Sentry init in `instrumentation.ts` per Sentry Next.js docs.
3. Uncomment the `Sentry.*` calls inside `reporter.sentry.ts`.

No other file changes. `reporter.ts` already routes to `sentryReporter` in production.

---

## Usage

### From a Client Component / hook

```tsx
"use client";

import { useErrorHandler } from "@/services/error-handling";

export function useLogin() {
  const { handleError } = useErrorHandler();

  return async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      handleError(error, { context: { feature: "auth", action: "signIn" } });
      //  -> user sees localized toast (EN or AR)
      //     e.g. "The password you entered is incorrect. Please try again."
      //  -> unknown/network errors also flow to Sentry once enabled.
    }
  };
}
```

### From a Server Component / Server Action / worker

```ts
import { detectError, errorReporter } from "@/services/error-handling";

try {
  await runJob();
} catch (raw) {
  const appError = detectError(raw, { feature: "jobs", action: "run" });
  errorReporter.captureException(appError, appError.context);
  throw appError; // let Next.js handle the response
}
```

### Apollo error link (already wired)

See [`src/lib/graphql/links/error-link.ts`](../../src/lib/graphql/links/error-link.ts). It calls `detectError` + `errorReporter.captureException` — no toast, since Apollo runs outside the React tree.

---

## Localization

Firebase messages live in the `errors` namespace under `src/locales/{en,ar}/errors/`:

```
src/locales/en/errors/
├── index.ts       # { firebase, generic }
├── firebase.ts    # per-code EN messages, includes a `default` fallback
└── generic.ts     # per-kind EN messages
```

Adding a new Firebase code end-to-end:

1. Add the code + `{ kind, severity }` to `firebase-codes.ts`.
2. Add the translation in `src/locales/en/errors/firebase.ts` and `src/locales/ar/errors/firebase.ts`.
3. Done — the detector, deliverer, and reporter all pick it up automatically.

Adding a new kind:

1. Add it to the `ErrorKind` union in `types.ts`.
2. Add a default channel list in `delivery-rules.ts`.
3. Add a translation in `generic.ts` (both locales).

---

## File reference

| File                       | Responsibility                                                 |
| -------------------------- | -------------------------------------------------------------- |
| `index.ts`                 | Public surface — the only file features may import from.       |
| `app-error.ts`             | `AppError` class + `ErrorKind` / `ErrorSeverity` types.        |
| `detect.ts`                | `detectError()` — normalize raw values to `AppError`.          |
| `deliver.ts`               | `deliverAppError()` and `detectAndDeliver()`.                  |
| `use-error-handler.ts`     | `useErrorHandler()` client hook (detect + toast + report).     |
| `firebase-codes.ts`        | `FIREBASE_CODE_MAP` + `isFirebaseError()` duck-typed guard.    |
| `delivery-rules.ts`        | `DEFAULT_CHANNELS` per `ErrorKind`.                            |
| `reporter.ts`              | Env-aware selection — the single swap point.                   |
| `reporter.types.ts`        | `ErrorReporter` interface — the provider contract.             |
| `reporter.console.ts`      | Console implementation used in `NODE_ENV=development`.         |
| `reporter.sentry.ts`       | Sentry stub — behaves as no-op until the SDK is installed.     |
| `reporter.noop.ts`         | Silent reporter for tests / SSR opt-out.                       |
| `types.ts`                 | `ErrorContext`, `Breadcrumb`, `ReporterUser`, `Channel` types. |
| `utils/to-error.ts`        | `toError()` — normalize `unknown` to `Error`.                  |
| `utils/serialize-error.ts` | Structured serialization for reporters.                        |

---

## What lives outside the module

- **Toast rendering** — `notify.error` from `src/shared/components/feedback/toast.tsx`. The delivery layer imports it, but toast styling and provider mounting remain a UI concern.
- **Translations** — `src/locales/{en,ar}/errors/*`. Owned by the localization system; delivery just reads keys via `useTranslations('errors')` through the app's i18n abstraction (`useTranslations` from `@/hooks/useTranslations`).
- **Apollo integration** — `src/lib/graphql/links/error-link.ts`. Not part of this module; it consumes the public surface only.

---

## Design principles

- **Two layers, one entry per site.** UI uses `useErrorHandler`; everything else uses `detectError` + `errorReporter`.
- **Duck-type external SDKs.** The module never imports `firebase/*` or `@apollo/client`.
- **Environment-aware reporter.** Console in local dev, Sentry-ready in production/staging.
- **Locale-first user messages.** Firebase codes always resolve to localized text with a fallback chain.
- **No dynamic registry.** Adding a rule is editing a map or a locale file — no runtime registration.
