# Porting Checklist

Use this when moving inputs to a new project.

## 1. Copy core UI primitives

Minimum set (most other inputs depend on these):

```
src/shared/components/ui/
  input.tsx          # fieldControlClassName, fieldInvalidClassName
  field.tsx
  button.tsx
  popover.tsx
  select.tsx         # used by ColorPicker
  spinner.tsx        # used by QuantityInput
```

## 2. Copy form glue

```
src/shared/components/forms/
  form.tsx           # Form, FormField
```

## 3. Copy utilities

```
src/lib/utils.ts     # cn() helper (clsx + tailwind-merge)
```

Input-specific utils as needed:

| Input               | Utils to copy                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| International phone | `src/shared/utils/international-phone.ts`, `src/shared/utils/phone.ts`                                                  |
| Saudi / Egypt phone | `src/shared/utils/phone.ts`, `src/constants/regex.ts`                                                                   |
| File upload         | `src/shared/utils/format-bytes.ts`                                                                                      |
| Operating hours     | `src/shared/utils/operating-hours.ts`, `src/shared/types/operating-hours.ts`, `src/shared/constants/operating-hours.ts` |

## 4. Copy providers (optional but recommended)

| Provider                       | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `src/providers/phone-country/` | Default country for `InternationalPhoneInput` from IP geo |
| `src/providers/i18n/`          | Translations for placeholders and labels                  |
| `src/providers/theme/`         | Dark mode tokens used by inputs                           |

## 5. Copy design tokens

Inputs rely on CSS variables in your global stylesheet:

- `--border`, `--input`, `--ring`, `--foreground`, `--muted-foreground`
- `--destructive` (invalid state)
- `--primary`, `--primary-foreground` (QuantityInput buttons)
- `--rating` (Rating component, if used near reviews)
- `--popover`, `--popover-foreground`

## 6. Install npm packages

See [01-setup-and-dependencies.md](./01-setup-and-dependencies.md).

## 7. Add locale keys

Minimum `common` keys used by inputs:

```ts
selectPlaceholder: "Select…",
searchPlaceholder: "Search…",
inputPlaceholder: "Enter a value…",
noResults: "No results found",
phoneCountryLabel: "Country",
internationalPhonePlaceholder: "Phone number",
internationalPhoneInvalidError: "Enter a valid phone number for the selected country",
currency: "SAR", // or your default currency label
```

## 8. Verify in a preview page

Copy `src/app/[locale]/(dev)/components-preview/` or create a minimal story page that renders each input with:

- empty state
- filled state
- `aria-invalid` state
- `disabled` state
- RTL (`dir="rtl"`) if you support Arabic

## 9. Form integration smoke test

Copy `form-validation-demo.tsx` pattern:

- `react-hook-form` + `zod` + `FormField`
- One text input + one composite input (Select or InternationalPhoneInput)

## File dependency tree (high level)

```
Field / FormField
  └── any control

ColorPicker
  ├── Popover
  ├── Select
  └── input.tsx (fieldInvalidClassName)

InternationalPhoneInput
  ├── input.tsx
  ├── international-phone.ts (utils)
  ├── PhoneCountryProvider (optional)
  └── @base-ui/react/combobox, @base-ui/react/input

QuantityInput
  ├── @base-ui/react/number-field
  └── Spinner

DatePicker / TimePicker / MonthPicker
  ├── Popover
  ├── date-fns
  └── Button

FileUpload
  └── Button, format-bytes

```
