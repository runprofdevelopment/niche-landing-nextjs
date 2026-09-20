# Field & Form

Foundation for every labeled input with validation errors.

## Field

**File:** `src/shared/components/ui/field.tsx`

Wraps label, control, description, and error message.

```tsx
import { Field, FieldLabel, FieldControl, FieldDescription, FieldError } from "@/shared/components";

<Field>
  <FieldLabel required>Email</FieldLabel>
  <FieldControl type="email" placeholder="you@example.com" />
  <FieldDescription>We never share your email.</FieldDescription>
  <FieldError />
</Field>;
```

| Component          | Purpose                                 |
| ------------------ | --------------------------------------- |
| `Field`            | Root group (`flex flex-col gap-1.5`)    |
| `FieldLabel`       | Label; pass `required` for red asterisk |
| `FieldControl`     | Text input wired to Field validation    |
| `FieldDescription` | Helper text below control               |
| `FieldError`       | Shows validation message when `invalid` |

Set `invalid` on `Field` to show error state:

```tsx
<Field invalid={!!error}>
  ...
  <FieldError>{error}</FieldError>
</Field>
```

## Form + FormField

**File:** `src/shared/components/forms/form.tsx`

Connects `react-hook-form` to `Field` automatically.

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Form, FormField, Input, Select } from "@/shared/components";

const schema = z.object({
  fullName: z.string().min(2, "Enter at least 2 characters"),
  plan: z.string().min(1, "Choose a plan"),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", plan: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="fullName"
          label="Full name"
          required
          render={(field) => <Input {...field} />}
        />
        <FormField
          control={form.control}
          name="plan"
          label="Plan"
          render={(field) => (
            <Select
              value={field.value || null}
              onValueChange={(v) => field.onChange(v ?? "")}
              items={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

### What FormField does automatically

- Wraps control in `Field`
- Renders `FieldLabel` when `label` is passed
- Sets `invalid={!!fieldState.error}` on Field
- Renders `FieldError` with `fieldState.error?.message`
- Passes `field` object from react-hook-form to your `render` function

### Composite inputs (non-standard `value`/`onChange`)

For inputs with custom value shapes, map manually in `render`:

```tsx
<FormField
  control={form.control}
  name="phoneNumber"
  label="Phone"
  render={(field, fieldState) => (
    <InternationalPhoneInput
      name={field.name}
      value={{ countryCode, phone: field.value }}
      onBlur={field.onBlur}
      onChange={({ countryCode: next, phone }) => {
        form.setValue("countryCode", next, { shouldValidate: true });
        field.onChange(phone);
      }}
      aria-invalid={fieldState.invalid || undefined}
    />
  )}
/>
```

### Zod + custom validation

```ts
const schema = z
  .object({
    countryCode: z.string(),
    phoneNumber: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!isValidInternationalPhone(values.countryCode, values.phoneNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["phoneNumber"],
        message: "Enter a valid phone number",
      });
    }
  });
```

## Invalid state contract

Every input should support:

```tsx
aria-invalid={fieldState.invalid || undefined}
```

This triggers `fieldInvalidClassName` (red border + ring) on the control.
