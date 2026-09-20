# 07 — Provider Rules

Providers supply app-wide context. They are infrastructure — not business logic.

---

## Provider Hierarchy

`RootProvider` is the **single entry point** mounted in `app/[locale]/layout.tsx`.

```
ThemeProvider          ← outermost
  └── ApolloProvider
        └── AuthProvider
              └── I18nProvider
                    └── {children}
```

### Why this order

| Position  | Provider | Reason                                                 |
| --------- | -------- | ------------------------------------------------------ |
| Outermost | Theme    | CSS class on `<html>` must be available to entire tree |
| 2nd       | Apollo   | GraphQL client needed by auth-aware links and features |
| 3rd       | Auth     | Session context available to i18n and features         |
| Innermost | I18n     | Locale/messages closest to rendered content            |

---

## Folder Structure

```
providers/
├── RootProvider.tsx        # Composes all providers
├── index.ts                # Barrel export
├── theme/
│   ├── ThemeProvider.tsx   # Wraps next-themes
│   ├── useTheme.ts         # App theme hook (never import next-themes directly)
│   └── index.ts
├── i18n/
│   ├── I18nProvider.tsx    # Wraps NextIntlClientProvider
│   ├── client.ts           # useTranslations implementation
│   ├── server.ts           # getTranslations (server)
│   ├── useCurrentLocale.ts # Active locale hook
│   ├── locale.ts           # Pure locale utilities
│   ├── navigation.ts       # Locale-aware Link, useRouter
│   ├── routing.ts          # next-intl routing config
│   ├── request-config.ts   # next-intl plugin config
│   ├── middleware.ts       # Locale middleware factory
│   └── index.ts
├── apollo/
│   ├── ApolloProvider.tsx
│   └── index.ts
└── auth/
    ├── AuthProvider.tsx
    ├── useAuth.ts
    └── index.ts
```

---

## Rules

### 1. Only `RootProvider` is imported in layouts

```tsx
// app/[locale]/layout.tsx
import { RootProvider } from '@/providers';

// ✅ Correct
<RootProvider locale={locale} messages={messages}>
  {children}
</RootProvider>

// ❌ Wrong — never mount individual providers in layouts
<ThemeProvider>
  <ApolloProvider>
    {children}
  </ApolloProvider>
</ThemeProvider>
```

### 2. Features import hooks, not providers

```tsx
// ✅
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import { useCurrentLocale } from "@/providers/i18n";

// ❌
import { AuthProvider } from "@/providers/auth"; // in a feature component
```

### 3. Each provider folder is self-contained

A provider module may grow internally without affecting other providers:

- `apollo/` → cache, links, error link, auth link
- `auth/` → session, permissions, guards
- `i18n/` → fallbacks, missing-key logging, analytics

### 4. Providers never import from features

```ts
// ❌ Forbidden in any provider file
import { UserMenu } from "@/features/users/components/user-menu";
```

### 5. Third-party libraries are wrapped, never exposed

| Library          | Wrapper             | App imports                              |
| ---------------- | ------------------- | ---------------------------------------- |
| `next-themes`    | `providers/theme/`  | `useTheme()`                             |
| `next-intl`      | `providers/i18n/`   | `useTranslations()`, `getTranslations()` |
| `@apollo/client` | `providers/apollo/` | `useQuery()` via feature hooks           |
| Firebase Auth    | `providers/auth/`   | `useAuth()`                              |

---

## Adding a New Provider

1. Create `providers/<name>/` folder with `Provider.tsx`, hooks, and `index.ts`
2. Add to `RootProvider.tsx` in the correct dependency position
3. Document the nesting reason in a code comment
4. Export public API from `providers/index.ts`
5. Update this document

---

## Provider vs Service

|          | Provider                     | Service                          |
| -------- | ---------------------------- | -------------------------------- |
| Purpose  | React context for components | SDK wrapper functions            |
| Has JSX  | Yes                          | No                               |
| Used by  | Components, hooks            | Hooks, server actions, providers |
| Location | `providers/`                 | `services/`                      |

Example: Firebase Auth context → `providers/auth/`. Firebase SDK initialization → `services/firebase/`.

---

## Anti-Patterns

| Anti-pattern                                                 | Fix                                |
| ------------------------------------------------------------ | ---------------------------------- |
| Multiple `RootProvider` instances                            | One in locale layout only          |
| Feature-specific context provider                            | Keep in `features/<name>/hooks/`   |
| Business logic inside provider                               | Move to `domain/` or feature hooks |
| Importing `next-themes` / `next-intl` outside provider layer | Use wrapper hooks                  |
