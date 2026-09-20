"use client";
"use no memo";

import { useTranslations } from "@/hooks/useTranslations";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { InfiniteSelect } from "@/shared/components/ui/infinite-select";
import { Input } from "@/shared/components/ui/input";
import { MultiSelect } from "@/shared/components/ui/multi-select";
import { Select } from "@/shared/components/ui/select-field";
import { Switch } from "@/shared/components/ui/switch";

import { DependentSelectFilterControl } from "./dependent-select-filter-control";

import type { DataTableDateRange, DataTableFilterDef } from "../types";

type DataTableFilterControlProps = {
  filter: DataTableFilterDef;
  value: unknown;
  onChange: (value: unknown) => void;
};

/** Renders just the value control matching `filter.type` — decoupled from the table so it works for both live and staged (draft) filter values. */
function DataTableFilterControl({ filter, value, onChange }: DataTableFilterControlProps) {
  const t = useTranslations("dataTable");

  if (filter.type === "select") {
    return (
      <Select
        value={(value as string | undefined) ?? null}
        onValueChange={(next: string | null) => onChange(next ?? undefined)}
        items={filter.options}
        placeholder={filter.placeholder ?? t("selectPlaceholder")}
      />
    );
  }

  if (filter.type === "multiSelect") {
    return (
      <MultiSelect
        value={(value as string[] | undefined) ?? []}
        onValueChange={(next: string[]) => onChange(next.length > 0 ? next : undefined)}
        items={filter.options}
        placeholder={filter.placeholder ?? t("selectPlaceholder")}
      />
    );
  }

  if (filter.type === "dateRange") {
    const range = (value as DataTableDateRange | undefined) ?? {};
    const setRange = (next: DataTableDateRange) => {
      const normalized: DataTableDateRange = {};
      if (next.from) normalized.from = next.from;
      if (next.to) normalized.to = next.to;
      onChange(normalized.from || normalized.to ? normalized : undefined);
    };
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <DatePicker
          value={range.from ?? null}
          onValueChange={(date: Date | null) => {
            const next: DataTableDateRange = { ...range };
            if (date) next.from = date;
            else delete next.from;
            setRange(next);
          }}
          placeholder={t("dateFromPlaceholder")}
          className="min-w-0"
        />
        <DatePicker
          value={range.to ?? null}
          onValueChange={(date: Date | null) => {
            const next: DataTableDateRange = { ...range };
            if (date) next.to = date;
            else delete next.to;
            setRange(next);
          }}
          placeholder={t("dateToPlaceholder")}
          className="min-w-0"
        />
      </div>
    );
  }

  if (filter.type === "input") {
    const isNumber = filter.inputType === "number";
    return (
      <Input
        type={isNumber ? "number" : "text"}
        min={isNumber ? 0 : undefined}
        value={(value as string | undefined) ?? ""}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "") {
            onChange(undefined);
            return;
          }
          if (isNumber && (next.includes("-") || Number(next) < 0)) return;
          onChange(next);
        }}
        placeholder={filter.placeholder}
      />
    );
  }

  if (filter.type === "asyncSelect") {
    return (
      <InfiniteSelect
        value={(value as string | undefined) ?? null}
        onValueChange={(next: string | null) => onChange(next ?? undefined)}
        items={filter.options}
        placeholder={filter.placeholder ?? t("selectPlaceholder")}
        {...(filter.loading !== undefined ? { loading: filter.loading } : {})}
        {...(filter.hasMore !== undefined ? { hasMore: filter.hasMore } : {})}
        {...(filter.onLoadMore ? { onLoadMore: filter.onLoadMore } : {})}
        {...(filter.onSearchChange ? { onSearchChange: filter.onSearchChange } : {})}
      />
    );
  }

  if (filter.type === "dependentSelect") {
    return <DependentSelectFilterControl filter={filter} value={value} onChange={onChange} />;
  }

  return <Switch checked={Boolean(value)} onCheckedChange={onChange} />;
}

export { DataTableFilterControl };
