import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import type { ComponentProps } from "react";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-primary",
        outline: "border-border text-primary border-primary",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        success: "border-transparent bg-active text-active-foreground",
        warning: "border-transparent bg-pending text-pending-foreground",
        inactive: "border-transparent bg-inactive text-inactive-foreground",
        selected: "border-transparent bg-selected text-selected-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/** Pass `dot` to show a small status dot before the label (e.g. status badges). */
function Badge({
  className,
  variant,
  dot,
  children,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? <span className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
