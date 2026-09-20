"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/shared/components/ui/label";

import type { ReactNode } from "react";

type FieldProps = {
  label?: ReactNode;
  /** Id of the control this label points at. */
  htmlFor?: string;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * Label-above-control field for UI that isn't backed by react-hook-form.
 *
 * Mirrors `FormItem`'s stacked layout and `space-y-2` label→control gap, so
 * hand-rolled fields match `FormField` ones.
 */
function Field({ label, htmlFor, required, description, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col space-y-2 text-start", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className={cn(error && "text-destructive")}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      <div className="space-y-2">
        {children}
        {description ? <p className="text-[0.8rem] text-muted-foreground">{description}</p> : null}
        {error ? <p className="text-[0.8rem] font-medium text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}

export { Field, type FieldProps };
