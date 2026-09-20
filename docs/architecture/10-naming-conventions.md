# 10 — Naming Conventions

Consistent naming makes the codebase searchable, predictable, and AI-friendly.

---

## Files & Folders

**Rule:** kebab-case for all files and folders.

| Type             | Pattern              | Example                   |
| ---------------- | -------------------- | ------------------------- |
| Component file   | `<name>.tsx`         | `user-card.tsx`           |
| Hook file        | `use-<name>.ts`      | `use-users.ts`            |
| Utility file     | `<name>.ts`          | `format-currency.ts`      |
| Type file        | `<name>.types.ts`    | `user.types.ts`           |
| Schema file      | `<name>.schema.ts`   | `create-user.schema.ts`   |
| Store file       | `<name>.store.ts`    | `sidebar.store.ts`        |
| GraphQL query    | `<name>.query.ts`    | `get-users.query.ts`      |
| GraphQL mutation | `<name>.mutation.ts` | `create-user.mutation.ts` |
| Test file        | `<name>.test.tsx`    | `user-card.test.tsx`      |
| Folder           | kebab-case           | `user-profile/`           |

---

## Components

| Rule                                          | Example                                           |
| --------------------------------------------- | ------------------------------------------------- |
| PascalCase name                               | `UserCard`, `BookingsTable`                       |
| File matches component                        | `user-card.tsx` → `UserCard`                      |
| Suffix by purpose                             | `UsersPage`, `CreateUserForm`, `UserCardSkeleton` |
| Named exports (except pages)                  | `export function UserCard()`                      |
| Default export only for Next.js pages/layouts | `export default function Page()`                  |

```tsx
// features/users/components/user-card.tsx
export function UserCard({ user }: UserCardProps) { ... }
```

---

## Hooks

| Rule                                     | Example                             |
| ---------------------------------------- | ----------------------------------- |
| Prefix with `use`                        | `useUsers`, `useDebounce`           |
| File: `use-<name>.ts`                    | `use-users.ts`                      |
| Name describes what it returns/does      | `useUsers` not `useUsersQuery`      |
| Feature hooks → `features/<name>/hooks/` | `features/users/hooks/use-users.ts` |
| App-wide hooks → `src/hooks/`            | `src/hooks/useDebounce.ts`          |

---

## Types & Interfaces

| Rule                                     | Example                                      |
| ---------------------------------------- | -------------------------------------------- |
| PascalCase                               | `User`, `BookingStatus`, `PaginatedResponse` |
| Props suffix                             | `UserCardProps`, `SidebarProps`              |
| Input/Output suffix                      | `CreateUserInput`, `UpdateBookingOutput`     |
| No `I` prefix                            | `User` not `IUser`                           |
| No `T` prefix                            | `Booking` not `TBooking`                     |
| Feature types → `features/<name>/types/` | `features/users/types/user.types.ts`         |
| Global types → `src/types/`              | `src/types/pagination.ts`                    |

```ts
// features/users/types/user.types.ts
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type UserCardProps = {
  user: User;
  onEdit?: (id: string) => void;
};
```

---

## GraphQL Operations

| Type         | File pattern                    | Export name       |
| ------------ | ------------------------------- | ----------------- |
| Query        | `get-<resource>.query.ts`       | `GET_USERS`       |
| Mutation     | `create-<resource>.mutation.ts` | `CREATE_USER`     |
| Mutation     | `update-<resource>.mutation.ts` | `UPDATE_USER`     |
| Mutation     | `delete-<resource>.mutation.ts` | `DELETE_USER`     |
| Fragment     | `<resource>.fragment.ts`        | `USER_FRAGMENT`   |
| Subscription | `<event>.subscription.ts`       | `BOOKING_UPDATED` |

```ts
// features/users/api/get-users.query.ts
import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($page: Int!) {
    users(page: $page) {
      ...UserFields
    }
  }
`;
```

**Rules:**

- SCREAMING_SNAKE_CASE for operation constants
- One operation per file
- All operations in `features/<name>/api/`

---

## Zod Schemas

| Rule                                  | Example                                                   |
| ------------------------------------- | --------------------------------------------------------- |
| camelCase + `Schema` suffix           | `createUserSchema`                                        |
| File: `<action>-<resource>.schema.ts` | `create-user.schema.ts`                                   |
| Infer types from schema               | `type CreateUserInput = z.infer<typeof createUserSchema>` |
| Location                              | `features/<name>/schemas/`                                |

```ts
// features/users/schemas/create-user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

---

## Zustand Stores

| Rule                                | Example                       |
| ----------------------------------- | ----------------------------- |
| camelCase + `Store` suffix for hook | `useSidebarStore`             |
| File: `<name>.store.ts`             | `sidebar.store.ts`            |
| Location                            | `src/stores/`                 |
| State type named `<Name>Store`      | `type SidebarStore = { ... }` |

```ts
// stores/sidebar.store.ts
type SidebarStore = {
  isOpen: boolean;
  toggle: () => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
```

---

## Constants

| Rule                                         | Example                                 |
| -------------------------------------------- | --------------------------------------- |
| SCREAMING_SNAKE_CASE for primitive constants | `MAX_PAGE_SIZE`, `DEFAULT_LOCALE`       |
| camelCase for object maps                    | `routes`, `permissions`, `localeLabels` |
| Location                                     | `src/constants/` or `src/config/`       |

```ts
// constants/routes.ts
export const routes = {
  dashboard: "/dashboard",
  users: "/users",
  bookings: "/bookings",
} as const;
```

---

## Variables & Functions

| Rule                                         | Example                        |
| -------------------------------------------- | ------------------------------ |
| camelCase                                    | `userName`, `fetchUsers`       |
| Boolean prefix: `is`, `has`, `can`, `should` | `isLoading`, `hasPermission`   |
| Event handlers: `handle` + action            | `handleSubmit`, `handleDelete` |
| Async functions: verb prefix                 | `fetchUsers`, `createBooking`  |

---

## Translation Keys

| Rule                       | Example                                   |
| -------------------------- | ----------------------------------------- |
| camelCase keys             | `title`, `createUser`, `noResults`        |
| Namespace = feature name   | `useTranslations('users')`                |
| Shared strings in `common` | `useTranslations('common')` → `t('save')` |

```ts
// locales/en/users/index.ts
const users = {
  title: "Users",
  create: "Create User",
  deleteConfirm: "Are you sure you want to delete this user?",
} as const;
```

---

## Booleans

```ts
const isLoading = true;
const hasPermission = false;
const canDelete = user.role === "admin";
const shouldRedirect = !isAuthenticated;
```

---

## Anti-Patterns

| Anti-pattern                     | Correct                 |
| -------------------------------- | ----------------------- |
| `UserCard.tsx` (PascalCase file) | `user-card.tsx`         |
| `IUser` interface                | `User`                  |
| `getUsersQuery` export name      | `GET_USERS`             |
| `users-schema.ts`                | `create-user.schema.ts` |
| `useUsersQueryHook.ts`           | `use-users.ts`          |
