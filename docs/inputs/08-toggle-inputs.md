# Toggle & Search Inputs

Boolean controls and standalone search.

---

## Checkbox

**File:** `src/shared/components/ui/checkbox.tsx`

```tsx
import { Checkbox } from "@/shared/components";

<label className="flex items-center gap-2">
  <Checkbox checked={accepted} onCheckedChange={setAccepted} />
  Accept terms
</label>;
```

Supports `aria-invalid` for form validation styling.

---

## Radio / RadioGroup

**File:** `src/shared/components/ui/radio.tsx`

```tsx
import { Radio, RadioGroup } from "@/shared/components";

<RadioGroup value={option} onValueChange={setOption} className="flex-row gap-4">
  <label className="flex items-center gap-2">
    <Radio value="a" /> Option A
  </label>
  <label className="flex items-center gap-2">
    <Radio value="b" /> Option B
  </label>
</RadioGroup>;
```

---

## Switch

**File:** `src/shared/components/ui/switch.tsx`

Toggle for on/off settings (not form submission booleans in tables).

```tsx
import { Switch } from "@/shared/components";

<label className="flex items-center gap-2">
  <Switch checked={enabled} onCheckedChange={setEnabled} />
  Notifications
</label>

// Read-only status display
<Switch checked={customer.isActive} disabled />
```

---

## SearchInput

See [03-text-inputs.md](./03-text-inputs.md).

Debounced search with magnifier icon. Used in toolbars and command palettes, not typically inside `FormField`.

---

## Tag

**File:** `src/shared/components/ui/tag.tsx`

Display-only chip (not an input, but often paired with MultiSelect).

```tsx
import { Tag } from "@/shared/components";

<Tag>Active</Tag>;
```

---

## Invalid / disabled states (all toggles)

Pass `aria-invalid` when validation fails:

```tsx
<Checkbox aria-invalid={fieldState.invalid} {...field} />
```

All toggle components inherit `fieldInvalidClassName` when invalid.

---

## When to use which

| Scenario                       | Component             |
| ------------------------------ | --------------------- |
| Single choice from 2–5 options | `RadioGroup`          |
| Multiple independent flags     | `Checkbox` per option |
| Enable/disable feature         | `Switch`              |
| Accept terms (form)            | `Checkbox`            |
| Show active status (read-only) | `Switch disabled`     |
| Filter/search bar              | `SearchInput`         |
