# Phone Inputs

Four phone variants for different markets. Pick one per form — do not mix contracts on the same field.

## Comparison

| Component                 | Markets       | Value shape              | API format                                                                              |
| ------------------------- | ------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `InternationalPhoneInput` | All countries | `{ countryCode, phone }` | `countryCode` = ISO (`SA`), `phone` = national digits; use `toApiDialCode()` for `+966` |
| `PhoneInput`              | Saudi only    | `string` E.164           | `+9665XXXXXXXX`                                                                         |
| `EgyptPhoneInput`         | Egypt only    | `string` E.164           | `+201XXXXXXXXX`                                                                         |
| `RegionalPhoneInput`      | SA or EG      | `string` E.164           | Switches between Saudi/Egypt based on `country` prop                                    |

---

## InternationalPhoneInput (recommended for admin forms)

**File:** `src/shared/components/ui/international-phone-input.tsx`  
**Utils:** `src/shared/utils/international-phone.ts`  
**Provider:** `src/providers/phone-country/PhoneCountryProvider.tsx`

### Value contract

```ts
type InternationalPhoneValue = {
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "SA"
  phone: string; // national digits only (no +966, no leading 0)
};
```

### Basic usage

```tsx
import { InternationalPhoneInput } from "@/shared/components";

const [value, setValue] = useState({ countryCode: "SA", phone: "" });

<InternationalPhoneInput value={value} onChange={setValue} placeholder="Phone number" />;
```

### With react-hook-form (split fields)

Store `countryCode` and `phoneNumber` as separate form fields:

```tsx
<FormField
  control={form.control}
  name="phoneNumber"
  label="Phone"
  required
  render={(field, fieldState) => (
    <InternationalPhoneInput
      name={field.name}
      value={{
        countryCode: form.watch("countryCode") || "SA",
        phone: field.value,
      }}
      onBlur={field.onBlur}
      onChange={({ countryCode, phone }) => {
        form.setValue("countryCode", countryCode, { shouldValidate: true });
        field.onChange(phone);
      }}
      aria-invalid={fieldState.invalid || undefined}
    />
  )}
/>
```

### Validation

```ts
import { isValidInternationalPhone, toApiDialCode } from "@/shared/utils";

// Zod superRefine
if (!isValidInternationalPhone(values.countryCode, values.phoneNumber)) {
  ctx.addIssue({ path: ["phoneNumber"], message: "Invalid phone" });
}

// API payload
const payload = {
  country_code: toApiDialCode(values.countryCode), // "+966"
  phone: values.phoneNumber, // "501234567"
};
```

### Utility functions

| Function                                   | Purpose                                   |
| ------------------------------------------ | ----------------------------------------- |
| `getDialCode("SA")`                        | `"+966"`                                  |
| `toApiDialCode("SA")`                      | `"+966"` (also accepts `"+966"` input)    |
| `fromApiDialCode("+966")`                  | `"SA"`                                    |
| `formatInternationalPhone(country, phone)` | `"+966 501234567"` for display            |
| `getPhoneCountryOptions(locale)`           | Country dropdown list                     |
| `getCountryFlagUrl(code)`                  | Flag CDN URL                              |
| `clampNationalPhoneInput(raw, country)`    | Strip invalid chars while typing          |
| `detectCountryFromInput(raw)`              | Auto-switch country when user pastes `+…` |

### Default country

Wraps app in `PhoneCountryProvider` (from IP geo headers). Falls back to `SA`.

```tsx
// .env.local optional override
PHONE_COUNTRY_OVERRIDE = SA;
```

---

## PhoneInput (Saudi)

**File:** `src/shared/components/ui/phone-input.tsx`  
**Utils:** `src/shared/utils/phone.ts`

Fixed `+966` prefix with SA flag. Value is **E.164** (`+9665XXXXXXXX`).

```tsx
import { PhoneInput } from "@/shared/components";

<PhoneInput value={phone} onChange={setPhone} />;
```

| Function                           | Purpose                     |
| ---------------------------------- | --------------------------- |
| `isSaudiPhoneNumber(value)`        | Validate                    |
| `normalizeSaudiPhoneNumber(value)` | E.164 or null               |
| `saudiPhoneInputValue(value)`      | National digits for display |

---

## EgyptPhoneInput

**File:** `src/shared/components/ui/egypt-phone-input.tsx`

Fixed `+20` prefix. Value is E.164 (`+201XXXXXXXXX`).

```tsx
import { EgyptPhoneInput } from "@/shared/components";

<EgyptPhoneInput value={phone} onChange={setPhone} />;
```

---

## RegionalPhoneInput

**File:** `src/shared/components/ui/regional-phone-input.tsx`

Renders `PhoneInput` or `EgyptPhoneInput` based on `country: "SA" | "EG"`.

```tsx
import { RegionalPhoneInput } from "@/shared/components";

<RegionalPhoneInput country="SA" value={phone} onChange={setPhone} />;
```

---

## Display formatting (tables/details)

```ts
import { formatInternationalPhone } from "@/shared/utils";

formatInternationalPhone(customer.country_code, customer.phone);
// "+966 501234567"
```

Used in customer list/details mappers via `formatInternationalPhone(country_code, phone)`.
