# Shared Inputs — Porting Guide

Portable reference for every form control in this project. Use these docs when copying inputs into another Next.js / React app.

## Quick start

1. Read [00-porting-checklist.md](./00-porting-checklist.md)
2. Install dependencies from [01-setup-and-dependencies.md](./01-setup-and-dependencies.md)
3. Copy `src/shared/components/ui/` primitives + any utilities they import
4. Wire [02-field-and-form.md](./02-field-and-form.md) for validation
5. Pick the input doc you need below

## Preview page

Open `/{locale}/components-preview` in dev to see most inputs live.

## Input catalog

| Input                                  | Doc                                                    | Source file                                              |
| -------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| **Field** (label + error wrapper)      | [02-field-and-form.md](./02-field-and-form.md)         | `src/shared/components/ui/field.tsx`                     |
| **Form / FormField** (react-hook-form) | [02-field-and-form.md](./02-field-and-form.md)         | `src/shared/components/forms/form.tsx`                   |
| **Input**                              | [03-text-inputs.md](./03-text-inputs.md)               | `src/shared/components/ui/input.tsx`                     |
| **PasswordInput**                      | [03-text-inputs.md](./03-text-inputs.md)               | `src/shared/components/ui/password-input.tsx`            |
| **Textarea**                           | [03-text-inputs.md](./03-text-inputs.md)               | `src/shared/components/ui/textarea.tsx`                  |
| **SearchInput**                        | [03-text-inputs.md](./03-text-inputs.md)               | `src/shared/components/ui/search-input.tsx`              |
| **CurrencyInput**                      | [03-text-inputs.md](./03-text-inputs.md)               | `src/shared/components/ui/currency-input.tsx`            |
| **InternationalPhoneInput**            | [04-phone-inputs.md](./04-phone-inputs.md)             | `src/shared/components/ui/international-phone-input.tsx` |
| **PhoneInput** (Saudi)                 | [04-phone-inputs.md](./04-phone-inputs.md)             | `src/shared/components/ui/phone-input.tsx`               |
| **EgyptPhoneInput**                    | [04-phone-inputs.md](./04-phone-inputs.md)             | `src/shared/components/ui/egypt-phone-input.tsx`         |
| **RegionalPhoneInput**                 | [04-phone-inputs.md](./04-phone-inputs.md)             | `src/shared/components/ui/regional-phone-input.tsx`      |
| **Select**                             | [05-selection-inputs.md](./05-selection-inputs.md)     | `src/shared/components/ui/select.tsx`                    |
| **MultiSelect**                        | [05-selection-inputs.md](./05-selection-inputs.md)     | `src/shared/components/ui/multi-select.tsx`              |
| **Combobox**                           | [05-selection-inputs.md](./05-selection-inputs.md)     | `src/shared/components/ui/combobox.tsx`                  |
| **InfiniteSelect**                     | [05-selection-inputs.md](./05-selection-inputs.md)     | `src/shared/components/ui/infinite-select.tsx`           |
| **DatePicker**                         | [06-date-time-inputs.md](./06-date-time-inputs.md)     | `src/shared/components/ui/date-picker.tsx`               |
| **TimePicker**                         | [06-date-time-inputs.md](./06-date-time-inputs.md)     | `src/shared/components/ui/time-picker.tsx`               |
| **MonthPicker**                        | [06-date-time-inputs.md](./06-date-time-inputs.md)     | `src/shared/components/ui/month-picker.tsx`              |
| **ColorPicker**                        | [07-specialized-inputs.md](./07-specialized-inputs.md) | `src/shared/components/ui/color-picker.tsx`              |
| **QuantityInput**                      | [07-specialized-inputs.md](./07-specialized-inputs.md) | `src/shared/components/ui/quantity-input.tsx`            |
| **FileUpload**                         | [07-specialized-inputs.md](./07-specialized-inputs.md) | `src/shared/components/upload/file-upload.tsx`           |
| **OperatingHoursInput**                | [07-specialized-inputs.md](./07-specialized-inputs.md) | `src/shared/components/forms/operating-hours-input.tsx`  |
| **Checkbox**                           | [08-toggle-inputs.md](./08-toggle-inputs.md)           | `src/shared/components/ui/checkbox.tsx`                  |
| **Radio / RadioGroup**                 | [08-toggle-inputs.md](./08-toggle-inputs.md)           | `src/shared/components/ui/radio.tsx`                     |
| **Switch**                             | [08-toggle-inputs.md](./08-toggle-inputs.md)           | `src/shared/components/ui/switch.tsx`                    |

## Shared conventions

- All controls use `fieldControlClassName` and `fieldInvalidClassName` from `input.tsx` for consistent height, border, focus ring, and `aria-invalid` styling.
- Invalid state: pass `aria-invalid={true}` (or use `FormField` which wires it automatically).
- Most inputs are **controlled** via `value` + `onChange` / `onValueChange`.
- Labels and errors: prefer `Field` + `FormField` instead of hand-wiring `aria-describedby`.

## Barrel export

Everything is re-exported from `src/shared/components/index.ts`. In app code:

```tsx
import { Input, ColorPicker, InternationalPhoneInput, FormField } from "@/shared/components";
```
