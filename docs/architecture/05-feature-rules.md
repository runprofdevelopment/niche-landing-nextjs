# 05 — Feature Rules

Features are the core organizational unit of this application. Each business domain is a self-contained module.

---

## Feature Structure (Mandatory)

Every feature **must** contain these folders:

```
features/<feature-name>/
├── api/            # GraphQL operations only
├── components/     # Feature-specific UI
├── hooks/          # Feature-specific hooks
├── schemas/        # Zod validation schemas
├── types/          # Feature-private types
├── domain/         # Pure business logic
├── utils/          # Feature-private utilities
└── index.ts        # Public API barrel
```

No exceptions. Even placeholder features follow this structure.

---

## Layer Responsibilities Within a Feature

### `api/` — GraphQL Operations Only

```ts
// features/users/api/get-users.query.ts
import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($page: Int!) {
    users(page: $page) {
      id
      name
      email
    }
  }
`;
```

**Allowed:** queries, mutations, subscriptions, fragments  
**Forbidden:** React hooks, UI components, business logic, fetch calls outside Apollo

---

### `domain/` — Pure Business Logic

```ts
// features/users/domain/can-delete-user.ts
import type { User } from "../types";

export function canDeleteUser(user: User, currentUserId: string): boolean {
  return user.id !== currentUserId && user.role !== "owner";
}
```

**Allowed:** pure functions, transformations, business rules  
**Forbidden:** React, Apollo, Firebase, `window`, `localStorage`

---

### `schemas/` — Zod Validation

```ts
// features/users/schemas/create-user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "agent", "viewer"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

---

### `hooks/` — Feature Orchestration

```ts
// features/users/hooks/use-users.ts
"use client";

export function useUsers() {
  // Apollo query + local UI state orchestration
}
```

Hooks orchestrate domain logic, API calls, and UI state. They do not contain raw business rules.

---

### `components/` — Feature UI

Components render UI for this feature only. They compose shared primitives and call feature hooks.

---

### `index.ts` — Public API

```ts
// features/users/index.ts
export { UsersPage } from "./components/users-page";
export { useUsers } from "./hooks/use-users";
export type { User } from "./types";
```

**Rule:** External code imports **only** from `@/features/users`, never from subfolders.

---

## Isolation Rules

### Rule 1: No cross-feature internal imports

```ts
// features/bookings/components/booking-form.tsx

// ❌ Forbidden
import { UserSelect } from "@/features/users/components/user-select";

// ✅ Allowed — if UserSelect is promoted to shared
import { UserSelect } from "@/shared/components/forms/user-select";

// ✅ Allowed — via public API only
import type { User } from "@/features/users";
```

### Rule 2: Features do not share utils directly

```ts
// ❌ Forbidden
import { formatUserName } from "@/features/users/utils/format-user-name";

// ✅ Promote to shared/utils/ if needed by 2+ features
import { formatPersonName } from "@/shared/utils/format-person-name";
```

### Rule 3: Features own their translations

Translation keys live in `locales/<lang>/<feature>/`, not inside the feature folder. See [08-localization.md](./08-localization.md).

---

## Adding a New Feature

1. Copy structure from `features/users/`
2. Register translation namespace in `locales/registry.ts`
3. Create `locales/en/<name>/index.ts` and `locales/ar/<name>/index.ts`
4. Add route in `app/[locale]/<route>/page.tsx` (thin wrapper)
5. Export public API from `features/<name>/index.ts`
6. Add route constant to `constants/routes.ts`

---

## Feature Size Guidelines

| Metric             | Limit      | Action when exceeded       |
| ------------------ | ---------- | -------------------------- |
| Component file     | ~150 lines | Extract sub-components     |
| Hook file          | ~80 lines  | Split into focused hooks   |
| `domain/` function | ~40 lines  | Extract helpers            |
| Public API exports | < 15       | Consider splitting feature |

---

## Anti-Patterns

| Anti-pattern                              | Why it's wrong           | Fix                                     |
| ----------------------------------------- | ------------------------ | --------------------------------------- |
| God feature (`features/app/`)             | Becomes a dumping ground | Split into proper domains               |
| API calls in components                   | Untestable, duplicated   | Move to hooks or server components      |
| Business logic in components              | Not reusable or testable | Move to `domain/`                       |
| Shared state between features via context | Hidden coupling          | Use Zustand store or Apollo cache       |
| Importing from `@/features/x/components/` | Breaks isolation         | Import from barrel or promote to shared |
