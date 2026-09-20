"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as React from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

export const fieldInvalidClassName =
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export const fieldControlClassName = cn(
  "flex h-10 w-full min-w-0 rounded-lg border border-border bg-input px-2.5 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  fieldInvalidClassName,
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof BaseInput>>(
  ({ className, placeholder, ...props }, ref) => {
    const t = useTranslations("common");

    return (
      <BaseInput
        ref={ref}
        placeholder={placeholder ?? t("inputPlaceholder")}
        className={cn(fieldControlClassName, className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
