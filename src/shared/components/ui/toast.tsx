"use client";

/**
 * Toast — notification system built on Base UI's Toast primitive.
 *
 * - `toastManager` is a global manager: call `toastManager.add({ title, description })`
 *   from anywhere (including outside the React tree).
 * - `notify.success()` / `notify.error()` / `notify.message()` are the preferred helpers.
 * - `toast.success("…")` keeps a Sonner-like string API for existing call sites.
 * - `<ToastProvider>` wires the manager into the tree and renders the viewport.
 *   Mount once in `RootProvider`.
 */

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import type { PropsWithChildren, ReactNode } from "react";

/** Global toast manager — usable from anywhere, even outside React components. */
export const toastManager = ToastPrimitive.createToastManager();

type NotifyOptions = {
  title?: ReactNode;
  description?: ReactNode;
  /** Adding a toast with an existing id updates it in place instead of stacking a duplicate. */
  id?: string;
};

/** Convenience helpers for the coloured toast variants. */
export const notify = {
  success: (options: NotifyOptions) => toastManager.add({ ...options, type: "success" }),
  error: (options: NotifyOptions) => toastManager.add({ ...options, type: "error" }),
  message: (options: NotifyOptions) => toastManager.add(options),
};

type ToastCallOptions = {
  description?: ReactNode;
  id?: string;
};

/**
 * Sonner-compatible helpers used across the app:
 * `toast.success("Saved")`, `toast.error("Failed")`, `toast.message("…")`.
 */
export const toast = {
  success: (title: ReactNode, options?: ToastCallOptions) => notify.success({ title, ...options }),
  error: (title: ReactNode, options?: ToastCallOptions) => notify.error({ title, ...options }),
  message: (title: ReactNode, options?: ToastCallOptions) => notify.message({ title, ...options }),
  info: (title: ReactNode, options?: ToastCallOptions) => notify.message({ title, ...options }),
};

const typeStyles: Record<string, { accent: string; icon: ReactNode }> = {
  success: {
    accent: "border-s-4 border-s-success",
    icon: <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />,
  },
  error: {
    accent: "border-s-4 border-s-destructive",
    icon: <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />,
  },
};

const rootClassName = cn(
  "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))]",
  "[--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))]",
  "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
  "absolute bottom-0 end-0 start-auto z-[calc(1000-var(--toast-index))] w-full origin-bottom",
  "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
  "rounded-lg border border-border bg-popover text-popover-foreground shadow-lg select-none",
  "after:absolute after:top-full after:start-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
  "h-[var(--height)] data-expanded:h-[var(--toast-height)]",
  "data-ending-style:opacity-0 data-limited:opacity-0",
  "data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))]",
  "data-starting-style:[transform:translateY(150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
  "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
  "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
  "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
);

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((item) => {
    const variant = item.type ? typeStyles[item.type] : undefined;

    return (
      <ToastPrimitive.Root
        key={item.id}
        toast={item}
        className={cn(rootClassName, variant?.accent)}
      >
        <ToastPrimitive.Content className="flex h-full items-start gap-3 overflow-hidden p-4 transition-opacity duration-[250ms] data-behind:opacity-0 data-expanded:opacity-100">
          {variant?.icon}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ToastPrimitive.Title className="text-sm font-semibold" />
            <ToastPrimitive.Description className="text-sm text-muted-foreground" />
          </div>
          <ToastPrimitive.Close
            aria-label="Dismiss"
            className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    );
  });
}

export function ToastProvider({ children }: PropsWithChildren) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed bottom-4 end-4 z-[100] mx-auto w-[calc(100vw-2rem)] sm:w-90">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
