# Date & Time Inputs

All use `Popover` + `date-fns`. Value types are native `Date` objects (not strings).

## DatePicker

**File:** `src/shared/components/ui/date-picker.tsx`

Calendar popup for picking a single date.

```tsx
import { DatePicker } from "@/shared/components";

const [date, setDate] = useState<Date | null>(null);

<DatePicker
  value={date}
  onValueChange={setDate}
  placeholder="Pickup date"
  dateFormat="dd MMM yyyy"
  isDateDisabled={(d) => d < new Date()} // optional: block past dates
/>;
```

| Prop             | Type                           | Notes                              |
| ---------------- | ------------------------------ | ---------------------------------- |
| `value`          | `Date \| null`                 | Controlled                         |
| `defaultValue`   | `Date \| null`                 | Uncontrolled                       |
| `onValueChange`  | `(date: Date \| null) => void` |                                    |
| `dateFormat`     | `string`                       | `date-fns` format, default `"PPP"` |
| `isDateDisabled` | `(date: Date) => boolean`      | Gray out non-selectable days       |

**API submit:** `date.toISOString()` or format with `date-fns`.

**FormField:**

```tsx
<FormField
  name="pickupDate"
  render={(field) => <DatePicker value={field.value ?? null} onValueChange={field.onChange} />}
/>
```

---

## TimePicker

**File:** `src/shared/components/ui/time-picker.tsx`

Time selection (hours/minutes).

```tsx
import { TimePicker } from "@/shared/components";

<TimePicker value={time} onValueChange={setTime} placeholder="Pickup time" />;
```

Used inside `OperatingHoursInput` for branch open/close times.

---

## MonthPicker

**File:** `src/shared/components/ui/month-picker.tsx`

Month-level selection (no day grid).

```tsx
import { MonthPicker } from "@/shared/components";

<MonthPicker placeholder="Select month" defaultValue={new Date()} />
<MonthPicker variant="ghost" defaultValue={new Date()} />
```

| Prop      | Type                   | Notes        |
| --------- | ---------------------- | ------------ |
| `variant` | `"default" \| "ghost"` | Visual style |

Use for reports, billing periods, fleet filters.

---

## Data table date range filter

`DataTableView` filters use `type: "dateRange"` which maps to `DataTableDateRange`:

```tsx
{
  id: "createdAt",
  label: "Created At",
  type: "dateRange",
}
```

Server filters typically use `GREATER_THAN_OR_EQUAL` / `LESS_THAN_OR_EQUAL` on ISO day boundaries.
