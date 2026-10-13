"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => undefined;

/**
 * `false` during SSR / first server snapshot; `true` after client hydration.
 * Prefer this over `useEffect(() => setMounted(true))` to avoid cascading renders.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
