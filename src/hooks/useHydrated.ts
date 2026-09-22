"use client";

import { useSyncExternalStore } from "react";

/** True only after client hydration — avoids SSR/localStorage mismatches. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
