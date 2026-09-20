# 12 — Code Review Checklist

Use this checklist for every pull request. All items must pass before merge.

---

## Architecture

- [ ] Code is in the correct folder per [02-folder-responsibilities.md](./02-folder-responsibilities.md)
- [ ] Components are in the correct category per [03-component-placement.md](./03-component-placement.md)
- [ ] Import rules respected per [04-import-rules.md](./04-import-rules.md)
- [ ] No cross-feature internal imports
- [ ] Feature exports only through barrel `index.ts`
- [ ] No business logic in `shared/components/ui/`

---

## Providers & Libraries

- [ ] No direct `next-intl` imports outside `providers/i18n/`
- [ ] No direct `next-themes` imports outside `providers/theme/`
- [ ] Only `RootProvider` mounted in layouts
- [ ] Features use `useTranslations` / `getTranslations`, not library directly

---

## Localization

- [ ] No hardcoded user-facing strings
- [ ] New strings added to both `en` and `ar` locale files
- [ ] New namespace registered in `locales/registry.ts`
- [ ] Translation keys use camelCase

---

## State Management

- [ ] Server data uses Apollo — not Zustand or useState
- [ ] Global UI state uses Zustand — not React context
- [ ] Shareable state (pagination, filters) uses URL params
- [ ] No React Query / SWR

---

## TypeScript

- [ ] Strict mode — no `any` (unless eslint-disable with comment)
- [ ] `import type` for type-only imports
- [ ] Types in correct location (feature vs global)
- [ ] Zod schemas infer types via `z.infer`

---

## Naming

- [ ] Files and folders in kebab-case
- [ ] Components in PascalCase
- [ ] Hooks prefixed with `use`
- [ ] GraphQL operations in SCREAMING_SNAKE_CASE
- [ ] Stores named `*.store.ts`

---

## Performance

- [ ] Server Components by default
- [ ] `'use client'` only where necessary
- [ ] Client boundary pushed as low as possible
- [ ] Heavy components dynamically imported
- [ ] No unnecessary `useMemo` / `useCallback`

---

## Error Handling

- [ ] Expected errors handled explicitly (validation, 404, auth)
- [ ] Unexpected errors reach error boundary or Sentry
- [ ] No silent `catch` blocks
- [ ] No `console.log` in committed code

---

## Code Quality

- [ ] ESLint passes (`pnpm lint`)
- [ ] TypeScript passes (`pnpm typecheck`)
- [ ] Prettier formatted (`pnpm format:check`)
- [ ] Build passes (`pnpm build`)
- [ ] Import order correct (auto-fixed by lint)

---

## Testing (when applicable)

- [ ] Domain logic has unit tests
- [ ] Critical user flows tested
- [ ] No tests that assert obvious behavior

---

## Security

- [ ] No secrets in code
- [ ] No `.env` files committed
- [ ] User input validated with Zod before API calls
- [ ] Auth checks before protected actions

---

## Instructions for AI Agents

> **This section is binding for all AI code generation tools** (Cursor, Copilot, ChatGPT, Claude, etc.).

### Before generating any code

1. **Read the Architecture Bible** — start with [README.md](./README.md) and the relevant topic document.
2. **Identify the correct layer** — feature, shared, provider, service, hook, or app route.
3. **Check component placement** — consult [03-component-placement.md](./03-component-placement.md).
4. **Check import rules** — consult [04-import-rules.md](./04-import-rules.md).

### Strict rules

| Rule                                      | Detail                                                      |
| ----------------------------------------- | ----------------------------------------------------------- |
| **Never violate folder responsibilities** | Every file has exactly one correct home.                    |
| **Never place code in the wrong module**  | A booking component does not go in `features/users/`.       |
| **Reuse before creating**                 | Search `shared/components/` before creating new UI.         |
| **Never duplicate business logic**        | Extract to `domain/` or promote to `shared/`.               |
| **Keep features isolated**                | No cross-feature internal imports. Ever.                    |
| **Prefer composition over duplication**   | Extend shared components with props, don't fork them.       |
| **Follow naming conventions**             | See [10-naming-conventions.md](./10-naming-conventions.md). |
| **Never import `next-intl` directly**     | Use `useTranslations` from `@/hooks/useTranslations`.       |
| **Never import `next-themes` directly**   | Use `useTheme` from `@/providers/theme`.                    |
| **Never hardcode strings**                | Use the translation system for all user-facing text.        |
| **Server Components by default**          | Only add `'use client'` when required.                      |
| **Thin pages**                            | `app/` pages compose features — no business logic inline.   |
| **One GraphQL operation per file**        | In `features/<name>/api/`.                                  |
| **Zod for all validation**                | Forms and API payloads.                                     |

### When the user's request conflicts with this document

> **The Architecture Bible takes priority.**

Respond by:

1. Explaining which rule would be violated
2. Proposing an architecture-compliant alternative
3. Only proceeding if the user explicitly asks to update the documentation first

### When creating a new feature

1. Copy structure from `features/users/`
2. Register translation namespace in `locales/registry.ts`
3. Create `en` and `ar` translation modules
4. Create thin route in `app/[locale]/`
5. Export public API from `features/<name>/index.ts`

### When creating a new shared component

1. Verify it is (or will be) used by 2+ features
2. Place in the correct `shared/components/<category>/`
3. Export from category `index.ts`
4. No business logic, no feature imports
5. Use translations for all user-facing text

### When unsure

- Default to the more restrictive, more isolated option
- Place code in a feature first — promote to shared later
- Ask for clarification rather than guessing the folder

---

## Reviewer Sign-Off

| Check                               | Reviewer | Date |
| ----------------------------------- | -------- | ---- |
| Architecture compliance             |          |      |
| Import rules                        |          |      |
| Localization                        |          |      |
| Performance                         |          |      |
| Code quality (lint/typecheck/build) |          |      |
