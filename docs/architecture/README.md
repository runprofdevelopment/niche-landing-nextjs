# Architecture Bible

**Easy Rent Agency — Enterprise Admin Dashboard Starter**

This is the **single source of truth** for how this project is structured, how code is organized, and how it must be written.

Every developer, reviewer, and AI agent **must read and follow** these documents before generating or modifying code.

---

## Authority

When a request, ticket, or AI prompt conflicts with this Architecture Bible:

> **The Architecture Bible wins.**

If a change requires breaking these rules, update the documentation first — then implement.

---

## Document Index

| #   | Document                                                   | Purpose                                           |
| --- | ---------------------------------------------------------- | ------------------------------------------------- |
| 01  | [Project Structure](./01-project-structure.md)             | High-level `src/` layout and technology stack     |
| 02  | [Folder Responsibilities](./02-folder-responsibilities.md) | What every top-level folder owns                  |
| 03  | [Component Placement](./03-component-placement.md)         | Where every type of UI belongs — with examples    |
| 04  | [Import Rules](./04-import-rules.md)                       | Allowed and forbidden dependencies between layers |
| 05  | [Feature Rules](./05-feature-rules.md)                     | Feature isolation, structure, and public API      |
| 06  | [State Management](./06-state-management.md)               | Apollo, Zustand, React state, URL state           |
| 07  | [Provider Rules](./07-provider-rules.md)                   | Provider composition and usage                    |
| 08  | [Localization](./08-localization.md)                       | i18n architecture, translations, wrappers         |
| 09  | [Error Handling](./09-error-handling.md)                   | Errors, boundaries, Sentry, logging               |
| 10  | [Naming Conventions](./10-naming-conventions.md)           | Files, folders, types, GraphQL, Zod, stores       |
| 11  | [Performance Guidelines](./11-performance-guidelines.md)   | RSC, client components, bundles, memoization      |
| 12  | [Code Review Checklist](./12-code-review-checklist.md)     | PR review gate                                    |

---

## Related Documents

- [Coding Standards](../coding-standards.md) — formatting, lint rules, and day-to-day conventions

---

## Quick Reference

```
src/
├── app/              → Next.js routes only (thin pages)
├── features/         → Business modules (isolated)
├── shared/           → Cross-feature reusable code
├── providers/        → App-level React providers
├── services/         → Third-party SDK integrations
├── stores/           → Global Zustand client state
├── hooks/            → App-wide utility hooks
├── locales/          → Feature-based translations
├── config/           → Library & env configuration
├── constants/        → App-wide immutable values
├── types/            → Global TypeScript types
├── lib/              → Core infrastructure utilities
└── styles/           → Global design tokens
```

---

## Instructions for AI Agents

See the dedicated section at the end of [12-code-review-checklist.md](./12-code-review-checklist.md#instructions-for-ai-agents).

**Before generating any code:**

1. Read `README.md` (this file) and the relevant topic documents.
2. Identify the correct layer (feature, shared, provider, etc.).
3. Verify import rules in `04-import-rules.md`.
4. Verify component placement in `03-component-placement.md`.
5. Reuse existing shared components before creating new ones.
6. Never import `next-intl` outside `src/providers/i18n/`.
7. Never place business logic in `shared/components/ui/`.

---

## Stack Summary

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Framework    | Next.js App Router             |
| Language     | TypeScript (strict)            |
| Styling      | Tailwind CSS + shadcn/ui       |
| Server State | Apollo Client                  |
| Client State | Zustand                        |
| Auth         | Firebase Authentication        |
| i18n         | next-intl (abstracted)         |
| Forms        | React Hook Form + Zod          |
| Tables       | TanStack Table                 |
| Monitoring   | Sentry                         |
| Testing      | (to be configured per feature) |
