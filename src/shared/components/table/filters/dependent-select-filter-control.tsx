"use client";

import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { InfiniteSelect } from "@/shared/components/ui/infinite-select";

import type { DataTableDependentSelectFilterDef, DataTableDependentSelectValue } from "../types";

type DependentSelectFilterControlProps = {
  filter: DataTableDependentSelectFilterDef;
  value: unknown;
  onChange: (value: unknown) => void;
};

function DependentSelectFilterControl({
  filter,
  value,
  onChange,
}: DependentSelectFilterControlProps) {
  const t = useTranslations("dataTable");
  const dependentValue = (value as DataTableDependentSelectValue | undefined) ?? {};
  const parentId = dependentValue.parent;
  const [childSearch, setChildSearch] = useState("");
  const {
    options: childOptions,
    loading: childLoading,
    hasMore: childHasMore,
    loadMore: loadMoreChild,
  } = filter.child.useOptions(parentId, {
    ...filter.child.context,
    search: childSearch,
  });

  const setValue = (next: DataTableDependentSelectValue | undefined) => {
    if (!next?.parent && !next?.child) {
      onChange(undefined);
      return;
    }
    onChange(next);
  };

  const { parent, child } = filter;

  return (
    <div className="flex flex-col gap-2">
      <InfiniteSelect
        value={parentId ?? null}
        onValueChange={(next) => setValue(next ? { parent: next } : undefined)}
        items={parent.options}
        placeholder={parent.placeholder ?? parent.label ?? t("selectPlaceholder")}
        {...(parent.loading !== undefined ? { loading: parent.loading } : {})}
        {...(parent.hasMore !== undefined ? { hasMore: parent.hasMore } : {})}
        {...(parent.onLoadMore ? { onLoadMore: parent.onLoadMore } : {})}
        {...(parent.onSearchChange ? { onSearchChange: parent.onSearchChange } : {})}
      />
      <InfiniteSelect
        value={dependentValue.child ?? null}
        onValueChange={(next) => {
          if (!parentId) return;
          setValue(next ? { parent: parentId, child: next } : { parent: parentId });
        }}
        items={childOptions}
        placeholder={child.placeholder ?? child.label ?? t("selectPlaceholder")}
        {...(childLoading !== undefined ? { loading: childLoading } : {})}
        {...(childHasMore !== undefined ? { hasMore: childHasMore } : {})}
        {...(loadMoreChild ? { onLoadMore: loadMoreChild } : {})}
        onSearchChange={setChildSearch}
        disabled={!parentId}
      />
    </div>
  );
}

export { DependentSelectFilterControl };
