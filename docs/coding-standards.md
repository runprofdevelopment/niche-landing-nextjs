# Coding Standards

This document defines the conventions for the Easy Rent Agency Next.js project. All contributors must follow these rules to keep the codebase consistent, maintainable, and scalable.

---

## Naming Conventions

### General

- Use **camelCase** for variables, functions, and object properties.
- Use **PascalCase** for React components, types, interfaces, and enums.
- Use **UPPER_SNAKE_CASE** for constants that are truly immutable and global (e.g. environment keys, magic numbers with domain meaning).
- Use **kebab-case** for file and folder names (see [File Naming](#file-naming)).
- Avoid abbreviations unless they are widely understood (`id`, `url`, `api`).

### Booleans

Prefix boolean variables and props with `is`, `has`, `can`, or `should`:

```ts
const isLoading = true;
const hasPermission = false;
```

---

## Folder Naming

- Use **kebab-case** for all folders: `user-profile`, `rental-list`, `auth-forms`.
- Group code by **feature** when it is feature-specific: `src/features/rentals/`.
- Place cross-feature utilities in `src/lib/`.
- Place shared UI primitives in `src/components/ui/` (shadcn/ui components only).
- Place app-wide layout and routing in `src/app/`.

### Recommended `src/` structure

```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/
│   └── ui/               # shadcn/ui primitives (do not add business logic)
├── features/             # Feature-isolated modules
│   └── <feature-name>/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
├── hooks/                # App-wide reusable hooks
├── lib/                  # Shared utilities (cn, formatters, etc.)
└── types/                # Shared TypeScript types
```

---

## Component Naming

- Name components with **PascalCase**: `RentalCard`, `UserAvatar`.
- One primary component per file; the file name must match the component name in kebab-case: `rental-card.tsx` exports `RentalCard`.
- Suffix specialized components descriptively:
  - `RentalListPage` — page-level component
  - `RentalForm` — form component
  - `RentalCardSkeleton` — loading state
- Prefer **named exports** for components. Use `default` export only for Next.js pages, layouts, and route handlers.

---

## Hooks Naming

- Always prefix custom hooks with `use`: `useRentals`, `useAuth`.
- Name hooks after what they **return or do**, not how they work internally.
- Co-locate feature-specific hooks inside the feature folder: `src/features/rentals/hooks/use-rentals.ts`.
- App-wide hooks go in `src/hooks/`.

---

## File Naming

| File type        | Convention          | Example                |
| ---------------- | ------------------- | ---------------------- |
| Component        | kebab-case          | `rental-card.tsx`      |
| Hook             | kebab-case + `use-` | `use-rentals.ts`       |
| Utility          | kebab-case          | `format-currency.ts`   |
| Type definitions | kebab-case          | `rental.types.ts`      |
| Test             | same + `.test`      | `rental-card.test.tsx` |
| Constant         | kebab-case          | `api-endpoints.ts`     |

---

## TypeScript Usage

- **Strict mode is required.** Do not disable strict checks project-wide.
- Prefer `interface` for object shapes that may be extended; use `type` for unions, intersections, and mapped types.
- Use `import type` for type-only imports (enforced by ESLint).
- **Never use `any`.** Use `unknown` and narrow with type guards, or define a proper type. If `any` is unavoidable, add an inline `eslint-disable-next-line` with a comment explaining why.
- Avoid non-null assertions (`!`) unless the value is guaranteed by a prior guard.
- Enable `noUncheckedIndexedAccess` — always handle `undefined` when accessing arrays or records by key.
- Export types from dedicated `*.types.ts` files when shared across multiple modules.

---

## React Best Practices

- Use **function components** only; no class components.
- Add `'use client'` only when the component needs client-side features (state, effects, event handlers, browser APIs).
- Keep components **pure** where possible — derive state from props rather than duplicating it.
- Prefer **composition** over prop drilling; use context sparingly and only for truly global concerns.
- Do not fetch data inside client components when it can be done in a Server Component or server action.
- Memoize (`useMemo`, `useCallback`, `React.memo`) only when there is a measured performance need — avoid premature optimization.
- Always provide a `key` prop when rendering lists.
- Do not use `console.log` in committed code. Use `console.warn` or `console.error` for intentional diagnostics (enforced by ESLint).

---

## Import Order

Imports must follow this order, with a blank line between each group:

1. **Node.js built-ins** — `fs`, `path`, `crypto`
2. **Third-party libraries** — `react`, `next`, `zod`, `@apollo/client`
3. **Absolute imports (`@/`)** — `@/components/ui/button`, `@/lib/utils`
4. **Relative imports** — `./rental-card`, `../types/rental.types`

Within each group, imports are sorted **alphabetically** (enforced by ESLint `import/order`).

```ts
import path from "path";

import { useQuery } from "@apollo/client";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { RentalCard } from "./rental-card";
import type { Rental } from "./rental.types";
```

---

## Component Size Recommendations

- Aim for **≤ 150 lines** per component file. If a component grows beyond this, extract sub-components or hooks.
- A single function body should not exceed **~40 lines** — extract helpers or custom hooks.
- JSX return blocks larger than **~60 lines** should be broken into child components.
- Forms: separate schema/validation, form logic (hook), and presentation (component).

---

## Feature Isolation

- Each feature is a self-contained module under `src/features/<feature-name>/`.
- A feature **must not import** from another feature's internal files. Cross-feature communication goes through:
  - Shared `src/lib/` utilities
  - Shared `src/types/`
  - Shared `src/components/ui/` primitives
  - Global state (Zustand store) or API layer (Apollo)
- Feature folders own their components, hooks, types, and utils.
- Do not place business logic in `src/components/ui/` — that directory is for presentational primitives only.

---

## Shared Component Rules

- **`src/components/ui/`** — shadcn/ui primitives only. Add via `pnpm dlx shadcn@latest add <component>`. No business logic.
- **App-wide composed components** (e.g. `PageHeader`, `EmptyState`) go in `src/components/` only when used across multiple features.
- Before creating a shared component, confirm it is used in **at least two features**. Do not prematurely abstract.
- Shared components must be purely presentational or accept all behavior via props — no direct API calls or feature-specific state.

---

## Git & Code Quality

- All code must pass **ESLint**, **Prettier**, and **TypeScript** checks before commit (enforced by Husky).
- Run `pnpm lint:fix` and `pnpm format` locally before pushing.
- Keep commits focused and atomic — one logical change per commit.

---

## Tooling Reference

| Tool       | Config file             | Command            |
| ---------- | ----------------------- | ------------------ |
| ESLint     | `eslint.config.mjs`     | `pnpm lint`        |
| Prettier   | `.prettierrc`           | `pnpm format`      |
| TypeScript | `tsconfig.json`         | `pnpm typecheck`   |
| Husky      | `.husky/pre-commit`     | runs automatically |
| VS Code    | `.vscode/settings.json` | format on save     |
