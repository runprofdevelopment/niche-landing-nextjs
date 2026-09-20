# 06 — State Management

Use the right state tool for each job. Using the wrong layer creates bugs, stale data, and unnecessary complexity.

---

## Decision Tree

```
Is the data fetched from the server/API?
  → Apollo Client

Is it global UI state needed across features?
  → Zustand (stores/)

Is it local to one component or small subtree?
  → React State (useState / useReducer)

Should it be reflected in the URL (shareable, bookmarkable)?
  → URL State (searchParams / router)
```

---

## Apollo Client — Server State

**Use for:** GraphQL queries, mutations, subscriptions, cached server data.

**Location:** Operations in `features/<name>/api/`. Client setup in `lib/apollo/` and `providers/apollo/`.

### When to use

| Scenario                  | Example                        |
| ------------------------- | ------------------------------ |
| Fetching lists            | Users list, bookings list      |
| Fetching details          | Single vehicle, agency profile |
| Creating/updating records | Create user mutation           |
| Paginated server data     | Bookings page 2                |
| Real-time updates         | Subscription to booking status |

### Example

```tsx
// features/users/hooks/use-users.ts
"use client";

import { useQuery } from "@apollo/client";
import { GET_USERS } from "../api/get-users.query";

export function useUsers(page: number) {
  return useQuery(GET_USERS, { variables: { page } });
}
```

### Rules

- GraphQL operations live in `features/<name>/api/` only
- Never call `fetch()` directly for GraphQL — always use Apollo
- Use Apollo cache policies defined in `lib/apollo/` — not per-component hacks
- **Do not use React Query or SWR** — Apollo is the single server-state solution

---

## Zustand — Global Client State

**Use for:** UI state that spans features and does not belong on the server.

**Location:** `src/stores/`

### Current stores

| Store              | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `theme.store.ts`   | UI theme preferences (pairs with `providers/theme/`) |
| `sidebar.store.ts` | Sidebar collapsed/expanded, mobile drawer            |
| `modal.store.ts`   | Global modal/dialog stack                            |

### When to use

| Scenario            | Example                               |
| ------------------- | ------------------------------------- |
| Sidebar open/closed | `useSidebarStore`                     |
| Global modal queue  | `useModalStore().open('delete-user')` |
| UI preferences      | Column visibility, table density      |

### When NOT to use

| Scenario                        | Use instead       |
| ------------------------------- | ----------------- |
| Server-fetched user list        | Apollo            |
| Form input values               | React Hook Form   |
| Auth session                    | `providers/auth/` |
| Current page number (shareable) | URL state         |

### Example

```ts
// stores/sidebar.store.ts
import { create } from "zustand";

type SidebarStore = {
  isOpen: boolean;
  toggle: () => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
```

### Rules

- One store per concern — no god store
- Feature-local state stays in feature hooks, not global stores
- Store files: `*.store.ts` in `src/stores/`

---

## React State — Local UI State

**Use for:** State confined to a component or small subtree.

### When to use

| Scenario                   | Example                                       |
| -------------------------- | --------------------------------------------- |
| Dropdown open/closed       | `const [isOpen, setIsOpen] = useState(false)` |
| Form field focus           | Local to input component                      |
| Accordion expanded section | Local to accordion                            |
| Hover state                | `onMouseEnter` / `onMouseLeave`               |
| Temporary UI toggles       | Show/hide password                            |

### Example

```tsx
function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  // ...
}
```

### Rules

- Prefer `useBoolean` from `@/hooks/useBoolean` for open/close patterns
- Lift state only when two siblings need it — not prematurely
- Do not put local state in Zustand

---

## URL State — Shareable & Bookmarkable State

**Use for:** State that should survive page refresh and be shareable via link.

### When to use

| Scenario               | Example                     |
| ---------------------- | --------------------------- |
| Current page in a list | `?page=2`                   |
| Active tab             | `?tab=settings`             |
| Search query           | `?q=john`                   |
| Sort order             | `?sort=name&order=asc`      |
| Filters                | `?status=active&role=admin` |

### Example

```tsx
// features/users/hooks/use-users-filters.ts
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function useUsersFilters() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const query = searchParams.get("q") ?? "";
  // ...
}
```

For locale-aware navigation, use `useRouter` and `usePathname` from `@/providers/i18n`.

### Rules

- Pagination, filters, and tabs that users expect to share → URL state
- Transient UI (hover, focus, animation) → React state
- Use `usePagination` from `@/hooks/usePagination` for consistent pagination patterns

---

## State Combination Example

**Users list page** uses all four layers:

| State               | Tool        | What                  |
| ------------------- | ----------- | --------------------- |
| User data           | Apollo      | `useQuery(GET_USERS)` |
| Sidebar collapsed   | Zustand     | `useSidebarStore()`   |
| Filter panel open   | React state | `useState(false)`     |
| Page + search query | URL state   | `?page=2&q=john`      |

---

## Anti-Patterns

| Anti-pattern                        | Fix                |
| ----------------------------------- | ------------------ |
| Storing server data in Zustand      | Use Apollo cache   |
| Storing UI toggle in URL            | Use React state    |
| Duplicating Apollo data in useState | Read from cache    |
| Global store for one feature's form | Feature hook + RHF |
| Using React Query alongside Apollo  | Remove React Query |
