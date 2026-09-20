"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseQueryFetchStateOptions = {
  /** When true, skip fetching and clear loading. */
  skip?: boolean;
  /** Artificial delay to mimic a network round-trip (mock / client tables). */
  delayMs?: number;
};

type UseQueryFetchStateResult = {
  /** True while a fetch/refetch is in flight — wire to DataTable `loading`. */
  loading: boolean;
  /** Re-run the query (same as Apollo `refetch`). */
  refetch: () => Promise<void>;
};

type FetchCycle = {
  varsKey: string;
  generation: number;
  skip: boolean;
};

/**
 * Apollo-like fetch state for mock stores and client-side tables.
 *
 * - `varsKey` changing (search / filter / sort / page) starts a fetch cycle
 * - `refetch()` starts the same cycle (toolbar refresh button)
 * - Wire `loading` to the table content overlay
 */
export function useQueryFetchState(
  varsKey: string,
  options: UseQueryFetchStateOptions = {},
): UseQueryFetchStateResult {
  const { skip = false, delayMs = 350 } = options;
  const [loading, setLoading] = useState(!skip);
  const [generation, setGeneration] = useState(0);
  const [cycle, setCycle] = useState<FetchCycle>({ varsKey, generation: 0, skip });
  const requestIdRef = useRef(0);

  // Start / clear loading when query inputs change — during render, not in an effect.
  if (cycle.varsKey !== varsKey || cycle.generation !== generation || cycle.skip !== skip) {
    setCycle({ varsKey, generation, skip });
    setLoading(!skip);
  }

  useEffect(() => {
    if (skip || !loading) return;

    const requestId = ++requestIdRef.current;
    const timeout = window.setTimeout(() => {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [varsKey, generation, skip, loading, delayMs]);

  const refetch = useCallback(async () => {
    if (skip) return;
    setGeneration((value) => value + 1);
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, delayMs);
    });
  }, [delayMs, skip]);

  return { loading, refetch };
}

/** Stable JSON key for query variables / table state. */
export function toQueryVarsKey(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
