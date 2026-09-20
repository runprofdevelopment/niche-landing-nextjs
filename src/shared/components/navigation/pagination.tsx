"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPageItems(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];

  if (page > 3) items.push("ellipsis");

  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (page < pageCount - 2) items.push("ellipsis");

  items.push(pageCount);
  return items;
}

function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const t = useTranslations("dataTable");
  const items = buildPageItems(page, pageCount);

  return (
    <nav aria-label={t("paginationAriaLabel")} className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="gap-1 px-2"
      >
        <ChevronLeft className="size-4" />
        {t("previous")}
      </Button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-9 items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === page ? "default" : "ghost"}
            size="icon"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={cn("size-9 rounded-md", item === page && "pointer-events-none")}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="gap-1 px-2"
      >
        {t("next")}
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

export { Pagination };
