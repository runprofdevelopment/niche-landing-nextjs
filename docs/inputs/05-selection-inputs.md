# Selection Inputs

Single and multi-select controls. All use searchable popups built on `@base-ui/react/combobox`.

## Select

**File:** `src/shared/components/ui/select.tsx`

Searchable single-select. Trigger looks like a normal dropdown.

```tsx
import { Select } from "@/shared/components";

<Select
  value={plan}
  onValueChange={setPlan}
  placeholder="Choose a plan"
  items={[
    { value: "daily", label: "Daily rental" },
    { value: "weekly", label: "Weekly rental", disabled: true },
  ]}
/>;
```

| Prop                | Type                            | Default                    | Notes                 |
| ------------------- | ------------------------------- | -------------------------- | --------------------- |
| `items`             | `{ value, label, disabled? }[]` | required                   | Options               |
| `value`             | `string \| null`                | —                          | Selected option value |
| `onValueChange`     | `(v: string \| null) => void`   | —                          |                       |
| `placeholder`       | `string`                        | `common.selectPlaceholder` |                       |
| `searchable`        | `boolean`                       | `true`                     | Show search in popup  |
| `searchPlaceholder` | `string`                        | `common.searchPlaceholder` |                       |
| `disabled`          | `boolean`                       | —                          |                       |

**FormField pattern:**

```tsx
<Select
  value={field.value || null}
  onValueChange={(v) => field.onChange(v ?? "")}
  items={options}
/>
```

---

## MultiSelect

**File:** `src/shared/components/ui/multi-select.tsx`

Multiple values as string array.

```tsx
import { MultiSelect } from "@/shared/components";

<MultiSelect
  value={["riyadh", "jeddah"]}
  onValueChange={setBranches}
  placeholder="Select branches…"
  items={[
    { value: "riyadh", label: "Riyadh" },
    { value: "jeddah", label: "Jeddah" },
  ]}
/>;
```

---

## Combobox

**File:** `src/shared/components/ui/combobox.tsx`

Lower-level combobox when Select is not enough (custom item rendering, async, etc.).

```tsx
import { Combobox } from "@/shared/components";

<Combobox value={selected} onValueChange={setSelected} items={options} placeholder="Search…" />;
```

Use `Select` for standard forms; use `Combobox` when you need more control.

---

## InfiniteSelect

**File:** `src/shared/components/ui/infinite-select.tsx`

Select with server-side pagination / infinite scroll for large lists.

```tsx
import { InfiniteSelect } from "@/shared/components";

<InfiniteSelect
  value={agencyId}
  onValueChange={setAgencyId}
  placeholder="Select agency"
  loadOptions={async ({ search, page }) => {
    const result = await fetchAgencies({ search, page });
    return { items: result.data, hasMore: result.hasMore };
  }}
/>;
```

Copy this when options don't fit in memory (agencies, branches, fleet items).

---

## ConfirmDialog built-in fields

`ConfirmDialog` accepts inline field configs for quick forms:

```tsx
<ConfirmDialog
  fields={[
    {
      name: "roleId",
      type: "select",
      label: "Assign Role",
      required: true,
      options: [{ value: "manager", label: "Manager" }],
    },
    {
      name: "reason",
      type: "textarea",
      label: "Reason",
      required: true,
    },
  ]}
  onConfirm={(values) => {
    /* values.roleId, values.reason */
  }}
/>
```

Supported field types: `select`, `textarea`, `input`.
