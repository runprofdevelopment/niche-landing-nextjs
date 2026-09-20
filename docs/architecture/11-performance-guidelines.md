# 11 — Performance Guidelines

Performance is a first-class concern. Default to Server Components and add client complexity only when necessary.

---

## Server Components vs Client Components

### Default: Server Component

Every component is a Server Component unless it needs client features.

**Server Components can:**

- Fetch data directly (Apollo server-side, `getTranslations`)
- Access backend resources
- Reduce JavaScript sent to the browser
- Render on the server without hydration cost

```tsx
// app/[locale]/users/page.tsx — Server Component (no 'use client')
import { getTranslations } from "@/providers/i18n";
import { UsersTable } from "@/features/users";

export default async function UsersPage() {
  const t = await getTranslations("users");
  return <UsersTable title={t("title")} />;
}
```

### Use Client Component (`'use client'`) only when you need:

| Need                                | Example                  |
| ----------------------------------- | ------------------------ |
| `useState`, `useEffect`             | Form inputs, toggles     |
| Event handlers                      | `onClick`, `onChange`    |
| Browser APIs                        | `localStorage`, `window` |
| Custom hooks with state             | `useUsers`, `useTheme`   |
| Apollo `useQuery` in interactive UI | Live search, polling     |

---

## Lazy Loading & Code Splitting

### Locale chunks

Each language is a separate bundle loaded on demand:

```ts
// locales/load-locale.ts — dynamic import per locale
const localeLoaders = {
  en: () => import("./en"),
  ar: () => import("./ar"),
};
```

Only the active locale's translations are loaded.

### Dynamic imports for heavy components

```tsx
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/features/finance/components/revenue-chart"), {
  loading: () => <ChartSkeleton />,
});
```

**Use dynamic import for:**

- Chart libraries
- Rich text editors
- Heavy modals/dialogs
- Maps

**Do not dynamically import:**

- Small shared components
- Layout shell components
- Above-the-fold content

---

## Bundle Optimization

| Practice                                      | Why                                                 |
| --------------------------------------------- | --------------------------------------------------- |
| Import icons individually from `lucide-react` | `import { Sun } from 'lucide-react'` not `import *` |
| Use `@/` path aliases                         | Enables tree-shaking                                |
| Keep `shared/components/ui/` lean             | Only add shadcn components you use                  |
| Avoid barrel re-export loops                  | Breaks tree-shaking                                 |
| No duplicate state libraries                  | Apollo only — no React Query                        |

---

## Memoization

**Default: do not memoize.** Add only when measured.

| Tool          | When                                            |
| ------------- | ----------------------------------------------- |
| `React.memo`  | Component re-renders with same props frequently |
| `useMemo`     | Expensive computation in render                 |
| `useCallback` | Callback passed to memoized child               |

```tsx
// ✅ Good — expensive filter on large list
const filtered = useMemo(() => users.filter((u) => u.name.includes(query)), [users, query]);

// ❌ Bad — premature memoization of simple value
const label = useMemo(() => t("title"), [t]);
```

---

## Data Fetching Performance

### Apollo Client

| Practice                         | Location              |
| -------------------------------- | --------------------- |
| Cache-first for stable data      | `lib/apollo/cache.ts` |
| Pagination via fetchMore / cache | Feature hooks         |
| Optimistic updates for mutations | Feature hooks         |
| Avoid refetching on every mount  | Apollo cache policies |

### Server Components

Fetch data on the server when the page loads:

```tsx
// Server Component — no client JS for data fetching
const t = await getTranslations("users");
```

---

## Image Optimization

Always use `next/image`:

```tsx
import Image from "next/image";

<Image src={user.avatar} alt={user.name} width={40} height={40} />;
```

---

## Font Optimization

Fonts are loaded via `next/font` in the locale layout — never via `<link>` tags.

```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
```

---

## Rendering Performance

| Practice                               | Detail                                        |
| -------------------------------------- | --------------------------------------------- |
| Keep pages thin                        | Compose from features — no inline logic       |
| Streaming                              | Use `loading.tsx` for route-level suspense    |
| Avoid layout shift                     | Use `Skeleton` components for loading states  |
| `suppressHydrationWarning` on `<html>` | Required for next-themes — already configured |

---

## Client Component Boundaries

Push `'use client'` as far down the tree as possible:

```
UsersPage (Server)
  └── UsersTable (Server)
        └── UserActions (Client) ← only this needs interactivity
```

Not:

```
UsersPage (Client) ← ❌ entire page is client because of one button
```

---

## Anti-Patterns

| Anti-pattern                            | Impact               | Fix                                     |
| --------------------------------------- | -------------------- | --------------------------------------- |
| `'use client'` on page components       | Entire page hydrates | Push client boundary down               |
| Fetching in `useEffect` what SSR can do | Waterfall, flash     | Server Component fetch                  |
| Importing entire lodash                 | Bundle bloat         | Import specific functions               |
| React Query + Apollo                    | Duplicate caching    | Apollo only                             |
| Memoizing everything                    | Complexity, no gain  | Measure first                           |
| Large translation files                 | Bundle size          | Feature-based namespaces (already done) |
