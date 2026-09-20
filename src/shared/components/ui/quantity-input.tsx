"use client";

/**
 * QuantityInput — a numeric stepper with outlined decrement (left), value field,
 * and filled increment (right). Built on Base UI's NumberField.
 */

import { NumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { fieldInvalidClassName } from "./input";
import { Spinner } from "./spinner";

type QuantityInputSize = "sm" | "default";

type QuantityInputProps = NumberField.Root.Props & {
  className?: string;
  /** `sm` (default) fits compact contexts like table cells; `default` matches the h-10 height of Input/Select for form grids. */
  size?: QuantityInputSize;
  /** Disables the control and overlays a spinner on the value field while a change is in flight. */
  loading?: boolean;
  /** Stretches the control to fill its container, spacing the buttons to the edges. */
  fullWidth?: boolean;
};

const sizeStyles: Record<QuantityInputSize, { button: string; icon: string; input: string }> = {
  sm: {
    button: "size-7",
    icon: "size-3.5",
    // Fixed width (fits "99,999", the max value) so the field doesn't resize per digit count.
    input: "h-7 w-20 px-1 text-sm",
  },
  default: {
    button: "size-10",
    icon: "size-4",
    input: "h-10 w-24 px-1.5 text-sm",
  },
};

function QuantityInput({
  className,
  size = "sm",
  loading = false,
  disabled,
  fullWidth = false,
  max = 99_999,
  min,
  ...props
}: QuantityInputProps) {
  const styles = sizeStyles[size];
  // Blocks typing more digits than `max` allows, so the field can't be typed past it
  // (Base UI's NumberField only clamps out-of-range values on blur, not while typing).
  const maxLength = Number.isFinite(max)
    ? String(Math.trunc(Math.abs(max as number))).length + (min != null && min < 0 ? 1 : 0)
    : undefined;

  return (
    <NumberField.Root
      data-slot="quantity-input"
      className={cn("inline-flex", fullWidth && "flex w-full", className)}
      disabled={disabled || loading}
      max={max}
      min={min}
      {...props}
    >
      <NumberField.Group
        className={cn("flex items-center gap-2", fullWidth && "w-full justify-between")}
      >
        <NumberField.Decrement
          className={cn(
            "flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            styles.button,
          )}
        >
          <Minus className={styles.icon} />
        </NumberField.Decrement>
        <div className="relative inline-flex">
          <NumberField.Input
            maxLength={maxLength}
            onKeyDown={(event) => {
              // Enter is a navigation key in NumberField and doesn't commit on its own;
              // blurring runs Base UI's commit path (formatting + `onValueCommitted`).
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            className={cn(
              "rounded-lg border border-border bg-input text-center text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              styles.input,
              loading && "text-transparent",
              fieldInvalidClassName,
            )}
          />
          {loading && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Spinner className={cn("text-muted-foreground", styles.icon)} />
            </span>
          )}
        </div>
        <NumberField.Increment
          className={cn(
            "flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            styles.button,
          )}
        >
          <Plus className={styles.icon} />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}

export { QuantityInput };
