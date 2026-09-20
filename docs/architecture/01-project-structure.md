# 01 — Project Structure

## Overview

This project is an **Enterprise Admin Dashboard Starter** built with a **feature-based architecture**. Each business domain is an isolated module. Cross-cutting concerns live in dedicated top-level folders.

The goal is to support **100+ pages** and **multiple business modules** without coupling, merge conflicts, or architectural drift.

---

## Top-Level `src/` Layout

```
src/
├── app/                    # Next.js App Router — routes, layouts, metadata
│   ├── layout.tsx          # Root passthrough layout
│   ├── globals.css         # Tailwind entry + design tokens
│   └── [locale]/           # Locale-scoped routes (en, ar)
│       ├── layout.tsx      # html, dir, RootProvider
│       └── page.tsx        # Route pages (thin)
│
├── features/               # Business modules (isolated by domain)
│   ├── users/
│   ├── bookings/
│   └── ...
│
├── shared/                 # Cross-feature reusable code
│   ├── components/         # Shared UI by category
│   ├── hooks/
│   ├── utils/
│   ├── schemas/
│   ├── types/
│   ├── constants/
│   └── assets/
│
├── providers/              # App-level React provider composition
│   ├── RootProvider.tsx
│   ├── theme/
│   ├── i18n/               # Localization abstraction layer
│   ├── apollo/
│   └── auth/
│
├── services/               # Third-party SDK wrappers (side effects)
│   ├── firebase/
│   ├── analytics/
│   └── logger/
│
├── stores/                 # Global Zustand stores
├── hooks/                  # App-wide utility hooks
├── locales/                # Feature-based translation modules
├── config/                 # Library & environment configuration
├── constants/              # App-wide route keys, permissions, regex
├── types/                  # Global TypeScript types
├── lib/                    # Core infrastructure (Apollo, GraphQL, cn)
├── styles/                 # Global CSS tokens (non-Tailwind)
└── middleware.ts           # Locale routing entry point
```

---

## `components/` vs `shared/components/`

| Path                        | Status                    | Purpose                                    |
| --------------------------- | ------------------------- | ------------------------------------------ |
| `src/components/ui/`        | Legacy (shadcn CLI)       | shadcn/ui primitives installed by CLI      |
| `src/shared/components/ui/` | **Target canonical path** | All new shadcn components should live here |

When adding shadcn components, update `components.json` aliases to point to `@/shared/components/ui` and migrate existing primitives over time.

---

## Feature Module Structure

Every feature **must** follow this exact structure:

```
features/<feature-name>/
├── api/            # GraphQL operations only
├── components/     # Feature-specific UI
├── hooks/          # Feature-specific hooks
├── schemas/        # Zod validation schemas
├── types/          # Feature-private types
├── domain/         # Pure business logic (no React, no API)
├── utils/          # Feature-private utilities
└── index.ts        # Public API barrel (only external import path)
```

**Example features:** `users`, `bookings`, `vehicles`, `agencies`, `finance`, `settings`

---

## Shared Component Categories

```
shared/components/
├── ui/             # shadcn/ui primitives only — no business logic
├── forms/          # Reusable form field wrappers & form layouts
├── table/          # Generic TanStack Table shells
├── navigation/     # Nav bars, breadcrumbs, locale/theme controls
├── layout/         # App shell — sidebar, header, page wrappers
├── feedback/       # Toasts, alerts, skeletons, empty states
├── data-display/   # Badges, avatars, stat cards
├── dialogs/        # Modals, sheets, drawers
├── charts/         # Chart wrappers
└── upload/         # File upload UI
```

---

## Route Structure

All user-facing routes live under the locale segment:

```
/en/dashboard
/en/users
/ar/users          ← RTL automatically applied
```

Locale detection, persistence, and RTL/LTR are handled by the localization layer (`providers/i18n/`).

---

## Configuration Files (Project Root)

| File                | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `next.config.ts`    | Next.js + next-intl plugin               |
| `tsconfig.json`     | TypeScript strict mode + `@/*` alias     |
| `eslint.config.mjs` | Lint rules including import restrictions |
| `.prettierrc`       | Code formatting                          |
| `components.json`   | shadcn/ui configuration                  |
| `.env.example`      | Environment variable template            |

---

## Dependency Flow (High Level)

```
app (pages/layouts)
  ↓ composes from
features (business UI + logic)
  ↓ may import from
shared (cross-feature UI + utils)
  ↓ may import from
hooks / stores / constants / types / lib / config
  ↓ may import from
providers / services
```

Never reverse this flow. See [04-import-rules.md](./04-import-rules.md) for the full matrix.
