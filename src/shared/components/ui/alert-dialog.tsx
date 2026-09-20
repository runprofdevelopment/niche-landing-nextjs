"use client";

/**
 * Alert Dialog — a modal that interrupts the user to confirm a consequential
 * action. Built on Base UI's AlertDialog primitive (no dismiss-on-outside-press;
 * the user must choose an action).
 */

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

import type { buttonVariants } from "../ui/button";
import type { ComponentProps } from "react";

const backdropClassName =
  "fixed inset-0 z-50 bg-black/80 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

function AlertDialogContent({
  className,
  children,
  showClose = true,
  ...props
}: AlertDialogPrimitive.Popup.Props & { showClose?: boolean }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className={backdropClassName} />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          "fixed start-1/2 top-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg outline-none rtl:translate-x-1/2",
          "transition-[transform,opacity] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <AlertDialogPrimitive.Close
            aria-label="Close"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute end-4 top-4 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <X className="size-4" />
          </AlertDialogPrimitive.Close>
        ) : null}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-1.5 text-start", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-center",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("font-display text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({ className, ...props }: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * Confirms the action and closes the dialog. Add `onClick` for the side effect.
 * Pass `variant="destructive"` for irreversible actions like delete confirmations.
 */
function AlertDialogAction({
  className,
  variant = "default",
  ...props
}: Omit<AlertDialogPrimitive.Close.Props, "className"> &
  VariantProps<typeof buttonVariants> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Close
      render={<Button variant={variant} className={className} />}
      {...props}
    />
  );
}

/** Dismisses the dialog without acting. */
function AlertDialogCancel({
  className,
  ...props
}: Omit<AlertDialogPrimitive.Close.Props, "className"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Close
      render={<Button variant="outline-invert" className={className} />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
