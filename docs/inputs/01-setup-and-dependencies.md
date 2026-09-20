# Setup & Dependencies

## Required npm packages

```bash
pnpm add @base-ui/react class-variance-authority clsx tailwind-merge lucide-react date-fns libphonenumber-js react-hook-form @hookform/resolvers zod
```

| Package                                           | Used by                                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `@base-ui/react`                                  | Input, Field, Select, Combobox, NumberField (QuantityInput), Slider (ColorPicker), Checkbox, Radio, Switch |
| `class-variance-authority`                        | Badge variants (optional)                                                                                  |
| `clsx` + `tailwind-merge`                         | `cn()` utility                                                                                             |
| `lucide-react`                                    | Icons in all inputs                                                                                        |
| `date-fns`                                        | DatePicker, MonthPicker, TimePicker                                                                        |
| `libphonenumber-js`                               | InternationalPhoneInput validation & formatting                                                            |
| `react-hook-form` + `zod` + `@hookform/resolvers` | FormField validation                                                                                       |

## Optional packages

| Package           | Used by                                           |
| ----------------- | ------------------------------------------------- |
| `color-name-list` | If you add named-color lookup elsewhere           |
| `nearest-color`   | Color name resolution (fleet features)            |
| `next-intl`       | i18n in this project (replace with your i18n lib) |
| `next-themes`     | Dark mode                                         |

## `cn()` utility

All inputs use this helper (`src/lib/utils.ts`):

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Shared field styles

Export from `input.tsx` and import in every control:

```ts
export const fieldInvalidClassName =
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export const fieldControlClassName = cn(
  "flex h-10 w-full min-w-0 rounded-lg border border-border bg-input px-2.5 py-1 text-sm ...",
  fieldInvalidClassName,
);
```

**Rule:** Any new input must reuse these classes so invalid/focus/disabled states match.

## Tailwind v4

This project uses Tailwind CSS v4 with design tokens as CSS variables. When porting:

1. Copy relevant tokens from `globals.css` (or your theme file)
2. Ensure `border-border`, `bg-input`, `text-muted-foreground`, etc. resolve correctly
3. Test dark mode — all inputs use semantic tokens, not hard-coded colors

## Base UI notes

- Primitives use `@base-ui/react/*` (not Radix directly)
- Select/Combobox pattern: pass `items` array, control via `value` + `onValueChange`
- NumberField (QuantityInput): uses `NumberField.Root`, `Increment`, `Decrement`, `Input`

## i18n hook

Inputs call `useTranslations("common")` for default placeholders. Either:

- Port `src/hooks/useTranslations.ts` + locale files, or
- Replace with plain string props / your i18n library

## Phone country provider

For `InternationalPhoneInput` default country:

```tsx
// layout.tsx (server)
import { getPhoneCountryFromHeaders } from "@/lib/geo/request-country";
import { PhoneCountryProvider } from "@/providers/phone-country";

const countryCode = await getPhoneCountryFromHeaders();

<PhoneCountryProvider countryCode={countryCode}>{children}</PhoneCountryProvider>;
```

Without the provider, the input falls back to `SA` (`DEFAULT_PHONE_COUNTRY_CODE`).
