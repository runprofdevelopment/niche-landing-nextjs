"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useTheme } from "@/providers/theme";

import { resolveCanvasTheme, type CanvasTheme } from "../domain/catalog";

function subscribeThemeClass(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => {};
  const root = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getThemeClassSnapshot() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Theme-aware canvas palette. Recomputes when next-themes or the `.dark` class changes.
 */
export function useCanvasPalette(): CanvasTheme {
  const { resolvedTheme } = useTheme();
  const themeClass = useSyncExternalStore(
    subscribeThemeClass,
    getThemeClassSnapshot,
    () => "light",
  );

  return useMemo(() => resolveCanvasTheme(), [resolvedTheme, themeClass]);
}
