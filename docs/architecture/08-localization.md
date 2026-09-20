# 08 — Localization

The application uses a **localization abstraction layer** that wraps `next-intl`. Application code never imports `next-intl` directly.

---

## Architecture

```
Feature / Page / Component
        ↓
useTranslations() / getTranslations()    ← application API
        ↓
providers/i18n/                          ← abstraction layer
        ↓
next-intl                                ← library (isolated)
```

---

## Application API

### Client Components

```tsx
import { useTranslations } from "@/hooks/useTranslations";

function UsersHeader() {
  const t = useTranslations("users");
  return <h1>{t("title")}</h1>;
}
```

### Server Components

```tsx
import { getTranslations } from "@/providers/i18n";

async function UsersPage() {
  const t = await getTranslations("users");
  return <h1>{t("title")}</h1>;
}
```

### Current Locale

```tsx
import { useCurrentLocale } from "@/providers/i18n";

const locale = useCurrentLocale(); // 'en' | 'ar'
```

### Locale-Aware Navigation

```tsx
import { Link, useRouter, usePathname } from "@/providers/i18n";

// Link automatically includes locale prefix
<Link href="/users">Users</Link>;

// Programmatic navigation with locale switch
router.replace(pathname, { locale: "ar" });
```

---

## Forbidden Imports

```tsx
// ❌ Never in application code
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createNavigation } from "next-intl/navigation";
```

Only files inside `src/providers/i18n/**` may import `next-intl`.

---

## Translation File Structure

Translations are **TypeScript modules**, not JSON files, organized by feature:

```
locales/
├── registry.ts              # Central namespace list
├── compose-messages.ts      # Validates all namespaces present
├── load-locale.ts           # Lazy-loads locale chunks
├── types.ts                 # Type-safe key inference
├── en/
│   ├── common/index.ts
│   ├── auth/index.ts
│   ├── users/index.ts
│   ├── bookings/index.ts
│   └── index.ts             # Composes all namespaces
└── ar/
    ├── common/index.ts
    ├── users/index.ts
    └── index.ts
```

### Translation module format

```ts
// locales/en/users/index.ts
const users = {
  title: "Users",
  create: "Create User",
  edit: "Edit User",
  delete: "Delete User",
  search: "Search users",
} as const;

export default users;
```

### Why TypeScript modules

- `as const` enables autocomplete on translation keys
- Type-checked across locales
- No runtime JSON parsing
- Tree-shakeable per namespace

---

## Namespace Registry

All namespaces are registered in `locales/registry.ts`:

```ts
export const FEATURE_NAMESPACES = [
  "common",
  "auth",
  "dashboard",
  "users",
  "bookings",
  "vehicles",
  "agencies",
  "finance",
  "settings",
] as const;
```

`composeMessages()` throws at build time if a registered namespace is missing from a locale.

---

## Adding a New Feature Translation

1. Add namespace to `locales/registry.ts`
2. Create `locales/en/<namespace>/index.ts`
3. Create `locales/ar/<namespace>/index.ts` (same keys, translated values)
4. Import and add to `locales/en/index.ts` and `locales/ar/index.ts`
5. Use: `useTranslations('<namespace>')` or `getTranslations('<namespace>')`

---

## Adding a New Language

1. Add locale to `config/i18n.ts` (`locales`, `localeLabels`, `localeDirection`)
2. Create `locales/<lang>/` mirroring `en/` structure
3. Add loader in `locales/load-locale.ts`
4. Update `src/middleware.ts` matcher if needed

---

## RTL / LTR Support

Arabic (`ar`) is RTL. English (`en`) is LTR.

- `dir` attribute is set on `<html>` in `app/[locale]/layout.tsx`
- Direction map lives in `config/i18n.ts`
- Use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`) over `ml-`/`mr-` where possible

---

## Supported Locales

| Code | Language | Direction |
| ---- | -------- | --------- |
| `en` | English  | LTR       |
| `ar` | العربية  | RTL       |

---

## Persistence

| Setting  | Mechanism                                   |
| -------- | ------------------------------------------- |
| Language | `NEXT_LOCALE` cookie (next-intl middleware) |
| Timezone | `UTC` default in `config/i18n.ts`           |

---

## Future Extension Points

These capabilities will be added inside `providers/i18n/` only:

| Capability            | File                     |
| --------------------- | ------------------------ |
| Missing-key logging   | `client.ts`, `server.ts` |
| Fallback locale       | `server.ts`              |
| Custom interpolation  | `types.ts`               |
| Permission-based keys | `client.ts`              |
| Runtime loading       | `request-config.ts`      |
| Analytics             | `server.ts`              |

Application code will not change when these are added.

---

## Rules

1. Never hardcode user-facing strings in components — use `useTranslations` / `getTranslations`
2. `common` namespace is for app-wide strings (save, cancel, loading)
3. Feature-specific strings go in the feature's namespace
4. English (`en`) is the source of truth for TypeScript key types
5. All locales must have identical keys per namespace
