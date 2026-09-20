# Specialized Inputs

Color picker, quantity stepper, file upload, and operating hours.

---

## ColorPicker

**File:** `src/shared/components/ui/color-picker.tsx`

Full HSV color picker in a popover. Outputs **hex** (uppercase, with optional alpha).

```tsx
import { ColorPicker } from "@/shared/components";

<ColorPicker value="#3B5BDB" onValueChange={(hex) => setColor(hex)} placeholder="Select color" />;
```

| Prop            | Type                    | Notes                          |
| --------------- | ----------------------- | ------------------------------ |
| `value`         | `string`                | Controlled hex, e.g. `#3B5BDB` |
| `defaultValue`  | `string`                | Uncontrolled initial           |
| `onValueChange` | `(hex: string) => void` | Emits on every change          |
| `disabled`      | `boolean`               |                                |

### Features

- Saturation/brightness square + hue slider + alpha slider
- Format toggle: HEX / RGB / HSL (manual text entry)
- EyeDropper API (Chrome/Edge) when available
- Swatch preview in trigger

### FormField (rent-to-own vehicle form)

```tsx
<FormField
  control={form.control}
  name="color"
  label="Vehicle color"
  required
  render={(field) => (
    <ColorPicker value={field.value || undefined} onValueChange={field.onChange} />
  )}
/>
```

### Dependencies

- `Popover`, `Select`, `@base-ui/react/slider`
- `common.selectPlaceholder` locale key

### API

Store the hex string directly: `"#FF5733"` or `"#FF573380"` (with alpha).

---

## QuantityInput

**File:** `src/shared/components/ui/quantity-input.tsx`

Numeric stepper: `+` button, value field, `−` button.

```tsx
import { QuantityInput } from "@/shared/components";

<QuantityInput defaultValue={1} min={0} max={100} />
<QuantityInput size="default" min={1} max={99999} fullWidth />
<QuantityInput loading disabled />
```

| Prop                     | Type                | Default     | Notes                            |
| ------------------------ | ------------------- | ----------- | -------------------------------- |
| `value` / `defaultValue` | `number`            | —           | From Base UI NumberField         |
| `min` / `max`            | `number`            | `max=99999` | Clamped on blur                  |
| `size`                   | `"sm" \| "default"` | `"sm"`      | `default` = h-10 (matches Input) |
| `loading`                | `boolean`           | `false`     | Spinner overlay on value         |
| `fullWidth`              | `boolean`           | `false`     | Stretch with buttons at edges    |
| `disabled`               | `boolean`           | —           |                                  |

### Sizes

| Size      | Button | Input width | Use in               |
| --------- | ------ | ----------- | -------------------- |
| `sm`      | 28px   | 80px        | Tables, compact rows |
| `default` | 40px   | 96px        | Form grids           |

### FormField

```tsx
<FormField
  name="quantity"
  render={(field) => (
    <QuantityInput
      value={field.value}
      onValueChange={field.onChange}
      min={1}
      max={99}
      size="default"
    />
  )}
/>
```

---

## FileUpload

**File:** `src/shared/components/upload/file-upload.tsx`

Drag-and-drop or browse file picker with preview row.

```tsx
import { FileUpload } from "@/shared/components";

<FileUpload
  label="Commercial Registration"
  hint="PDF, JPG or PNG (max. 5MB)"
  accept=".pdf,.jpg,.png"
  file={file}
  onFileChange={setFile}
  progress={uploadProgress} // 0-100 while uploading
/>

// Compact variant (single line)
<FileUpload variant="compact" label="Invoice" file={file} onFileChange={setFile} />

// Edit mode: show existing remote file
<FileUpload
  existingFile={{ name: "doc.pdf", href: signedUrl }}
  onExistingRemove={() => clearRemoteFile()}
  onFileChange={setFile}
/>
```

| Prop               | Type                           | Notes                         |
| ------------------ | ------------------------------ | ----------------------------- |
| `variant`          | `"default" \| "compact"`       | Layout                        |
| `file`             | `File \| null`                 | Local selected file           |
| `existingFile`     | `{ name, meta?, href? }`       | Remote file in edit mode      |
| `onFileChange`     | `(file: File \| null) => void` |                               |
| `onExistingRemove` | `() => void`                   | When user removes remote file |
| `progress`         | `number`                       | 0–100 upload progress bar     |
| `accept`           | `string`                       | HTML accept attribute         |
| `tone`             | `"default" \| "success"`       | Preview row color             |

### Dependencies

- `formatBytes` from `src/shared/utils/format-bytes.ts`
- `Button` component

---

## OperatingHoursInput

**File:** `src/shared/components/forms/operating-hours-input.tsx`

Full week schedule editor with per-day toggles and time ranges.

```tsx
import { OperatingHoursInput } from "@/shared/components";

<OperatingHoursInput
  value={hours}
  onChange={setHours}
  mode="create" // or "edit"
  bounds={{ open: "08:00", close: "22:00" }}
  isTwentyFourSeven={is247}
  onTwentyFourSevenChange={setIs247}
/>;
```

### Value type

```ts
type OperatingHourInput = {
  day: WeekDay; // "MONDAY" | "TUESDAY" | ...
  is_open: boolean;
  open_time: string; // "09:00"
  close_time: string; // "18:00"
};
```

### Dependencies (copy all)

- `src/shared/utils/operating-hours.ts`
- `src/shared/types/operating-hours.ts`
- `src/shared/constants/operating-hours.ts`
- `TimePicker`, `Switch`, `Card` components
- Locale keys: `dayMonday`, `dayTuesday`, … in your branches/common namespace

### Features

- 24/7 toggle
- Per-day on/off switch
- `TimePicker` for open/close
- `onDayTurnedOff` callback for confirmation dialogs
