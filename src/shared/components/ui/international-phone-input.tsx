"use client";

/**
 * InternationalPhoneInput — country dropdown (flag + dial code) + national number.
 */

import { Combobox } from "@base-ui/react/combobox";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { useCurrentLocale } from "@/providers/i18n";
import { usePhoneCountry } from "@/providers/phone-country";
import {
  clampNationalPhoneInput,
  detectCountryFromInput,
  fromApiDialCode,
  getCountryFlagUrl,
  getDialCode,
  getPhoneCountryOptions,
  type InternationalPhoneValue,
} from "@/shared/utils/international-phone";

import { fieldControlClassName, fieldInvalidClassName } from "./input";

import type { CountryCode } from "libphonenumber-js";
import type { ChangeEvent, ComponentProps } from "react";

type CountryOption = {
  value: CountryCode;
  label: string;
  dialCode: string;
};

type InternationalPhoneInputProps = Omit<
  ComponentProps<typeof InputPrimitive>,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  value?: InternationalPhoneValue;
  defaultCountryCode?: string;
  onChange?: (value: InternationalPhoneValue) => void;
  onBlur?: ComponentProps<typeof InputPrimitive>["onBlur"];
  name?: string;
};

function CountryFlag({ countryCode, className }: { countryCode: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote flag CDN
    <img
      src={getCountryFlagUrl(countryCode)}
      alt=""
      width={20}
      height={14}
      loading="lazy"
      className={cn("h-3.5 w-5 rounded-xs object-cover", className)}
    />
  );
}

function InternationalPhoneInput({
  className,
  value,
  defaultCountryCode,
  onChange,
  onBlur,
  name,
  placeholder,
  disabled,
  id,
  ...props
}: InternationalPhoneInputProps) {
  const t = useTranslations("common");
  const locale = useCurrentLocale();
  const ipCountryCode = usePhoneCountry();
  const [search, setSearch] = useState("");

  const resolvedDefault = fromApiDialCode(defaultCountryCode || ipCountryCode).toUpperCase();
  const countryCode = fromApiDialCode(value?.countryCode || resolvedDefault, resolvedDefault);
  const phone = value?.phone ?? "";
  const dialCode = getDialCode(countryCode);

  const countries = useMemo(() => getPhoneCountryOptions(locale), [locale]);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.value === countryCode) ?? null,
    [countries, countryCode],
  );

  const filteredCountries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const list = !needle
      ? countries
      : countries.filter(
          (country) =>
            country.label.toLowerCase().includes(needle) ||
            country.value.toLowerCase().includes(needle) ||
            country.dialCode.includes(needle),
        );
    if (selectedCountry && !list.some((country) => country.value === selectedCountry.value)) {
      return [selectedCountry, ...list];
    }
    return list;
  }, [countries, search, selectedCountry]);

  const emit = (next: InternationalPhoneValue) => {
    onChange?.({
      countryCode: fromApiDialCode(next.countryCode, resolvedDefault),
      phone: next.phone,
    });
  };

  const handleCountryChange = (option: CountryOption | null) => {
    if (!option) return;
    emit({
      countryCode: option.value,
      phone: clampNationalPhoneInput(phone, option.value),
    });
    setSearch("");
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const detected = detectCountryFromInput(raw);
    if (detected && detected.countryCode !== countryCode) {
      emit({
        countryCode: detected.countryCode,
        phone: clampNationalPhoneInput(detected.phone, detected.countryCode),
      });
      return;
    }

    emit({
      countryCode,
      phone: clampNationalPhoneInput(raw, countryCode),
    });
  };

  return (
    <div
      data-slot="international-phone-input"
      className={cn(
        fieldControlClassName,
        "flex items-center gap-0 pe-2.5 ps-1",
        "has-[[data-slot=phone-input-field]:focus-visible]:border-ring",
        "has-[[data-slot=phone-input-field]:focus-visible]:ring-3",
        "has-[[data-slot=phone-input-field]:focus-visible]:ring-ring/50",
        "has-[[data-slot=phone-input-field][aria-invalid=true]]:border-destructive",
        "has-[[data-slot=phone-input-field][aria-invalid=true]]:ring-3",
        "has-[[data-slot=phone-input-field][aria-invalid=true]]:ring-destructive/20",
        className,
      )}
    >
      <Combobox.Root<CountryOption>
        items={filteredCountries}
        value={selectedCountry}
        onValueChange={handleCountryChange}
        inputValue={search}
        onInputValueChange={(next) => setSearch(next)}
        itemToStringLabel={(option) => (option ? `${option.label} ${option.dialCode}` : "")}
        isItemEqualToValue={(a, b) => a?.value === b?.value}
        filter={null}
        disabled={disabled}
        onOpenChange={(open) => {
          if (!open) setSearch("");
        }}
      >
        <Combobox.Trigger
          disabled={disabled}
          className={cn(
            "inline-flex h-full shrink-0 items-center gap-1 rounded-md px-1.5 text-sm text-foreground outline-none",
            "hover:bg-muted/60 focus-visible:bg-muted/60",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
          aria-label={t("phoneCountryLabel")}
        >
          <CountryFlag countryCode={countryCode} />
          <span className="tabular-nums text-muted-foreground">{dialCode}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Combobox.Trigger>

        <Combobox.Portal>
          <Combobox.Positioner sideOffset={6} align="start" className="z-50">
            <Combobox.Popup
              className={cn(
                "flex max-h-72 w-72 flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none",
                "origin-(--transform-origin) transition-[transform,opacity]",
                "data-starting-style:scale-95 data-starting-style:opacity-0",
                "data-ending-style:scale-95 data-ending-style:opacity-0",
              )}
            >
              <div className="border-b border-border p-2">
                <Combobox.Input
                  placeholder={t("searchPlaceholder")}
                  className={cn(
                    "flex h-9 w-full rounded-md border border-border bg-input px-2.5 text-sm outline-none",
                    "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                />
              </div>
              <Combobox.Empty>
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  {t("noResults")}
                </div>
              </Combobox.Empty>
              <Combobox.List className="flex-1 overflow-y-auto p-1 data-empty:p-0">
                {(country: CountryOption) => (
                  <Combobox.Item
                    key={country.value}
                    value={country}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
                      "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                      "data-selected:font-medium",
                    )}
                  >
                    <CountryFlag countryCode={country.value} />
                    <span className="min-w-0 flex-1 truncate">{country.label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {country.dialCode}
                    </span>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <span className="mx-1 h-4 w-px shrink-0 bg-border" aria-hidden />

      <InputPrimitive
        {...props}
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        disabled={disabled}
        data-slot="phone-input-field"
        value={phone}
        onChange={handlePhoneChange}
        onBlur={onBlur}
        placeholder={placeholder ?? t("internationalPhonePlaceholder")}
        className={cn(
          "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground shadow-none outline-none",
          "placeholder:text-muted-foreground focus-visible:ring-0",
          fieldInvalidClassName,
        )}
      />
    </div>
  );
}

export { InternationalPhoneInput, type InternationalPhoneInputProps };
export type { InternationalPhoneValue };
