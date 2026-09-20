# 04 — Import Rules

Import rules enforce layer boundaries. Violating them creates coupling that compounds over time.

---

## Dependency Matrix

| From ↓ / To → | `app` |   `features`   | `shared` | `providers` | `services` | `stores` | `hooks` | `lib` | `config` | `constants` | `types` | `locales` |
| ------------- | :---: | :------------: | :------: | :---------: | :--------: | :------: | :-----: | :---: | :------: | :---------: | :-----: | :-------: |
| `app`         |   —   |       ✅       |    ✅    |     ✅      |     ❌     |    ❌    |   ✅    |  ✅   |    ✅    |     ✅      |   ✅    |    ❌     |
| `features`    |  ❌   | ⚠️ barrel only |    ✅    |     ✅      |     ✅     |    ✅    |   ✅    |  ✅   |    ✅    |     ✅      |   ✅    |    ❌     |
| `shared`      |  ❌   |       ❌       |    ✅    |     ✅      |     ❌     |    ❌    |   ✅    |  ✅   |    ✅    |     ✅      |   ✅    |    ❌     |
| `providers`   |  ❌   |       ❌       |    ❌    |     ✅      |     ✅     |    ❌    |   ❌    |  ✅   |    ✅    |     ✅      |   ✅    |    ✅     |
| `services`    |  ❌   |       ❌       |    ❌    |     ❌      |     ✅     |    ❌    |   ❌    |  ✅   |    ✅    |     ✅      |   ✅    |    ❌     |
| `stores`      |  ❌   |       ❌       |    ❌    |     ❌      |     ❌     |    ✅    |   ✅    |  ✅   |    ✅    |     ✅      |   ✅    |    ❌     |
| `hooks`       |  ❌   |       ❌       |    ❌    |     ✅      |     ❌     |    ❌    |   ✅    |  ✅   |    ✅    |     ✅      |   ✅    |    ❌     |
| `lib`         |  ❌   |       ❌       |    ❌    |     ❌      |     ❌     |    ❌    |   ❌    |  ✅   |    ✅    |     ✅      |   ✅    |    ✅     |

**Legend:** ✅ Allowed · ❌ Forbidden · ⚠️ Special rule

---

## Core Rules

### 1. Features never import from other features' internals

```ts
// ✅ Allowed
import { UserAvatar } from "@/features/users";

// ❌ Forbidden
import { useUsers } from "@/features/users/hooks/use-users";
import { UserCard } from "@/features/users/components/user-card";
```

Cross-feature needs go through `shared/`, `stores/`, `services/`, or Apollo.

---

### 2. Shared never imports from features

```ts
// ❌ Forbidden — shared must not know about features
import { UserType } from "@/features/users/types";
```

If shared code needs a type, promote it to `types/` or `shared/types/`.

---

### 3. Providers never import from features

Providers are infrastructure. They wrap libraries and expose context — they do not contain business logic.

```ts
// ❌ Forbidden
import { useBookings } from "@/features/bookings";
```

---

### 4. Features may import from providers

```ts
// ✅ Allowed
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import { useCurrentLocale } from "@/providers/i18n";
```

---

### 5. Services never import from features or shared components

```ts
// ✅ Allowed
import { firebaseConfig } from "@/config/firebase";

// ❌ Forbidden
import { BookingForm } from "@/features/bookings/components/booking-form";
```

---

### 6. Never import `next-intl` outside the localization layer

```ts
// ❌ Forbidden everywhere except src/providers/i18n/**
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

// ✅ Allowed — use the abstraction
import { useTranslations } from "@/hooks/useTranslations";
import { getTranslations } from "@/providers/i18n";
import { useCurrentLocale } from "@/providers/i18n";
```

Enforced by ESLint `no-restricted-imports`.

---

### 7. Never import `next-themes` outside `providers/theme/`

```ts
// ❌ Forbidden
import { useTheme } from "next-themes";

// ✅ Allowed
import { useTheme } from "@/providers/theme";
```

---

## Import Order

All files must follow this order (enforced by ESLint):

```ts
// 1. Node.js built-ins
import path from "path";

// 2. Third-party libraries
import { z } from "zod";

// 3. Absolute imports (@/)
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

// 4. Relative imports
import { UserCard } from "./user-card";
import type { User } from "./user.types";
```

Blank line between each group. Alphabetical within groups.

---

## Type-Only Imports

Always use `import type` for type-only imports:

```ts
// ✅
import type { User } from "@/features/users";

// ❌
import { User } from "@/features/users"; // if User is only used as a type
```

---

## Barrel Exports

| Layer           | Barrel file                        | Rule                         |
| --------------- | ---------------------------------- | ---------------------------- |
| Feature         | `features/<name>/index.ts`         | Only public API              |
| Shared category | `shared/components/<cat>/index.ts` | Export all public components |
| Providers       | `providers/index.ts`               | Export providers + hooks     |
| Hooks           | `hooks/index.ts`                   | Export app-wide hooks        |

**Never import from deep paths when a barrel exists:**

```ts
// ✅
import { LanguageSwitcher } from "@/shared/components/navigation";

// ⚠️ Avoid (unless tree-shaking requires it)
import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";
```

---

## Path Alias

All imports use the `@/*` alias mapped to `src/*`:

```ts
import { cn } from "@/lib/utils"; // ✅
import { cn } from "../../../lib/utils"; // ❌
```

---

## Circular Dependency Prevention

If module A imports B and B imports A:

1. Extract shared code to `lib/` or `shared/`.
2. Use dependency injection (pass as props/callbacks).
3. Never use barrel re-exports that create cycles.

---

## Quick Violation Checklist

- [ ] Feature importing another feature's internal folder?
- [ ] Shared component importing from a feature?
- [ ] Provider importing business logic?
- [ ] Direct `next-intl` or `next-themes` import outside provider layer?
- [ ] Relative import crossing layer boundaries unnecessarily?
