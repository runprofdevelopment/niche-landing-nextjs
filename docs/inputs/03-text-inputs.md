# Text Inputs

## Input

**File:** `src/shared/components/ui/input.tsx`

Standard text field. Built on `@base-ui/react/input`.

```tsx
import { Input } from "@/shared/components";

<Input placeholder="Email" />
<Input type="number" min={0} />
<Input disabled />
<Input aria-invalid />
```

| Prop                   | Type     | Notes                                 |
| ---------------------- | -------- | ------------------------------------- |
| All native input props | —        | Passed through to Base UI Input       |
| `placeholder`          | `string` | Defaults to `common.inputPlaceholder` |

**With FormField:** spread `field` directly: `<Input {...field} />`

---

## PasswordInput

**File:** `src/shared/components/ui/password-input.tsx`

Input with show/hide toggle.

```tsx
import { PasswordInput } from "@/shared/components";

<PasswordInput placeholder="••••••••" />;
```

Same props as `Input`. Value is plain text (not masked in state).

---

## Textarea

**File:** `src/shared/components/ui/textarea.tsx`

Multi-line text. Uses same `fieldControlClassName`.

```tsx
import { Textarea } from "@/shared/components";

<Textarea placeholder="Notes…" rows={4} />;
```

---

## SearchInput

**File:** `src/shared/components/ui/search-input.tsx`

Debounced search field with icon.

```tsx
import { SearchInput } from "@/shared/components";

<SearchInput
  placeholder="Search bookings…"
  onValueChange={(value) => setQuery(value)} // immediate
  onDebouncedChange={(value) => setDebounced(value)} // after debounce
/>;
```

Use for toolbar/filter search, not for form submission fields.

---

## CurrencyInput

**File:** `src/shared/components/ui/currency-input.tsx`

Number input with currency prefix (from `common.currency` locale key, default `"SAR"`).

```tsx
import { CurrencyInput } from "@/shared/components";

<CurrencyInput value={amount} onChange={(e) => setAmount(e.target.value)} min={0} step="0.01" />;
```

| Detail | Value                                 |
| ------ | ------------------------------------- |
| Type   | `number`                              |
| Min    | `0`                                   |
| Step   | `0.01`                                |
| Prefix | Localized currency label (left/start) |

**API submit:** parse `Number(value)` before sending to backend.

---

## When to use which

| Use case                   | Component       |
| -------------------------- | --------------- |
| Name, email, ID, free text | `Input`         |
| Password                   | `PasswordInput` |
| Long description, reason   | `Textarea`      |
| Table/toolbar search       | `SearchInput`   |
| Money amount in forms      | `CurrencyInput` |
