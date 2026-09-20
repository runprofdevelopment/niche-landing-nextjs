"use client";

/**
 * App toast surface — Base UI toast wired for the error-handling delivery layer
 * and feature call sites. Prefer `notify.*` for structured payloads; `toast.*`
 * keeps the previous Sonner-style string helpers.
 */

export { notify, toast, toastManager, ToastProvider } from "@/shared/components/ui/toast";
