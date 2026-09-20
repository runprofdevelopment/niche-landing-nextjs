# 02 — Folder Responsibilities

Every top-level folder has a single, well-defined responsibility. Placing code in the wrong folder is an architectural violation.

---

## `src/app/`

**Owns:** Next.js routing — pages, layouts, loading states, error boundaries, route handlers, metadata.

| Belongs here                                         | Does NOT belong here               |
| ---------------------------------------------------- | ---------------------------------- |
| `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | Business logic                     |
| Route-level `generateMetadata`                       | Data fetching logic (use features) |
| Thin page components that compose features           | Reusable UI components             |
| `globals.css` (Tailwind entry)                       | GraphQL operations                 |
| Locale layout (`[locale]/layout.tsx`)                | Zustand stores                     |

**Example — correct:**

```tsx
// app/[locale]/users/page.tsx
import { UsersPage } from "@/features/users";

export default function Page() {
  return <UsersPage />;
}
```

**Example — wrong:**

```tsx
// app/[locale]/users/page.tsx — ❌ 200 lines of table logic inline
```

---

## `src/features/`

**Owns:** Everything specific to one business domain.

| Belongs here                       | Does NOT belong here                 |
| ---------------------------------- | ------------------------------------ |
| Feature UI components              | Cross-feature shared components      |
| Feature hooks                      | Global Zustand stores                |
| GraphQL operations for this domain | Firebase SDK calls (use `services/`) |
| Zod schemas for this domain        | Provider implementations             |
| Pure domain/business logic         | App-wide utility hooks               |

**Rule:** Other features import **only** from `@/features/<name>` (the barrel `index.ts`), never from internal subfolders.

---

## `src/shared/`

**Owns:** Code reused by **two or more features** but not global enough for `lib/` or `hooks/`.

| Belongs here                      | Does NOT belong here        |
| --------------------------------- | --------------------------- |
| `LanguageSwitcher`, `ThemeToggle` | Feature-specific tables     |
| Generic `DataTable` shell         | User-specific row renderers |
| `PageHeader`, `EmptyState`        | GraphQL operations          |
| Cross-feature Zod schemas         | Domain business rules       |

**Promotion rule:** Start in `features/<x>/`. When a second feature needs it → promote to `shared/`. When it becomes infrastructure → promote to `lib/`.

---

## `src/providers/`

**Owns:** App-level React context providers and their composition.

| Belongs here                                 | Does NOT belong here                         |
| -------------------------------------------- | -------------------------------------------- |
| `RootProvider` composition                   | Feature-specific context                     |
| `ThemeProvider`, `I18nProvider`              | Business logic                               |
| `AuthProvider`, `ApolloProvider`             | UI components                                |
| Localization abstraction (`providers/i18n/`) | Direct usage in features (use hooks instead) |

**Rule:** `app/layout.tsx` imports **only** `RootProvider`. No other provider is mounted directly in layouts or pages.

---

## `src/services/`

**Owns:** Side-effectful integrations with third-party SDKs.

| Belongs here                     | Does NOT belong here                       |
| -------------------------------- | ------------------------------------------ |
| Firebase Auth/Firestore wrappers | React components                           |
| Analytics event dispatchers      | GraphQL operations (use `features/*/api/`) |
| Centralized logger               | UI state                                   |

**Rule:** Features call services. Services never import from features.

---

## `src/stores/`

**Owns:** Global client-side UI state via Zustand.

| Belongs here                 | Does NOT belong here                 |
| ---------------------------- | ------------------------------------ |
| Theme preferences (UI-level) | Server-fetched data (use Apollo)     |
| Sidebar collapse state       | Feature-specific form state          |
| Global modal stack           | Auth session (use `providers/auth/`) |

**Current stores:** `theme.store.ts`, `sidebar.store.ts`, `modal.store.ts`

---

## `src/hooks/`

**Owns:** App-wide utility hooks with no feature coupling.

| Belongs here                        | Does NOT belong here                   |
| ----------------------------------- | -------------------------------------- |
| `useDebounce`, `useMediaQuery`      | `useUsers` (→ `features/users/hooks/`) |
| `useTranslations` (re-export entry) | `useAuth` (→ `providers/auth/`)        |
| `usePagination` (generic)           | Feature data fetching hooks            |

---

## `src/locales/`

**Owns:** All translation content, organized by feature namespace.

| Belongs here                         | Does NOT belong here                          |
| ------------------------------------ | --------------------------------------------- |
| `en/users/index.ts`                  | Inline strings in components                  |
| `ar/bookings/index.ts`               | JSON translation files                        |
| `registry.ts`, `compose-messages.ts` | next-intl configuration (→ `providers/i18n/`) |

---

## `src/config/`

**Owns:** Static configuration values and library setup options.

| Belongs here                                        | Does NOT belong here   |
| --------------------------------------------------- | ---------------------- |
| `env.ts` — environment variable accessors           | Runtime business logic |
| `theme.ts` — theme constants                        | React components       |
| `i18n.ts` — locale constants (no next-intl imports) | GraphQL queries        |
| `apollo.ts`, `firebase.ts`                          | Feature types          |

---

## `src/constants/`

**Owns:** App-wide immutable values used across layers.

| Belongs here                 | Does NOT belong here                   |
| ---------------------------- | -------------------------------------- |
| `routes.ts` — path constants | Feature-specific enums                 |
| `permissions.ts` — RBAC keys | Mutable state                          |
| `regex.ts` — shared patterns | Validation schemas (→ Zod in features) |

---

## `src/types/`

**Owns:** Global TypeScript types not tied to a single feature.

| Belongs here                           | Does NOT belong here                        |
| -------------------------------------- | ------------------------------------------- |
| `api.ts` — generic API response shapes | `User` type (→ `features/users/types/`)     |
| `pagination.ts`                        | Component prop types                        |
| `auth.ts` — session/user shapes        | Zod-inferred types (co-locate with schemas) |

---

## `src/lib/`

**Owns:** Core infrastructure utilities with no UI or business meaning.

| Belongs here                                    | Does NOT belong here |
| ----------------------------------------------- | -------------------- |
| `utils.ts` — `cn()` helper                      | Feature formatters   |
| `apollo/` — client factory                      | React hooks          |
| `graphql/` — fragment utilities, codegen output | Business rules       |

---

## `src/styles/`

**Owns:** Global design tokens and CSS not tied to a single component.

| Belongs here             | Does NOT belong here                   |
| ------------------------ | -------------------------------------- |
| Theme override CSS files | Component-scoped styles (use Tailwind) |
| Print stylesheets        | Tailwind entry (`app/globals.css`)     |

---

## Decision Tree

```
Is it a Next.js route?
  → app/

Is it specific to one business domain?
  → features/<name>/

Is it UI used by 2+ features?
  → shared/components/<category>/

Is it a React provider?
  → providers/

Is it a third-party SDK wrapper?
  → services/

Is it global client UI state?
  → stores/

Is it a generic hook?
  → hooks/

Is it a translation string?
  → locales/<lang>/<namespace>/

Is it configuration?
  → config/ or constants/
```
