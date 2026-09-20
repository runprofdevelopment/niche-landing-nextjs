"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { useGuestListQuery } from "../graphql";

const PAGE_SIZE = 20;

type UseInfiniteOwnersOptions = {
  skip?: boolean;
  search?: string;
};

/**
 * Infinite owner options for selects — `guestList` filtered by `guestType: owner`.
 */
export function useInfiniteOwners({ skip, search }: UseInfiniteOwnersOptions = {}) {
  const [page, setPage] = useState(1);
  const [allOwners, setAllOwners] = useState<Array<{ id: string; name: string; email: string }>>(
    [],
  );
  const [hasMore, setHasMore] = useState(true);

  const filters = useMemo(
    () => ({
      guestType: "owner" as const,
      ...(search?.trim() ? { fullName: search.trim() } : {}),
    }),
    [search],
  );

  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    startTransition(() => {
      setPage(1);
      setAllOwners([]);
      setHasMore(true);
    });
  }, [filtersKey]);

  const { users, totalCount, loading } = useGuestListQuery({
    filters,
    pagination: { limit: PAGE_SIZE, page },
    skip,
  });

  useEffect(() => {
    if (loading || skip) return;

    const nextHasMore = users.length >= PAGE_SIZE && page * PAGE_SIZE < totalCount;

    startTransition(() => {
      setAllOwners((prev) => {
        const pageRows = users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }));
        if (page === 1) return pageRows;
        const existingIds = new Set(prev.map((owner) => owner.id));
        const next = pageRows.filter((owner) => !existingIds.has(owner.id));
        return next.length > 0 ? [...prev, ...next] : prev;
      });
      setHasMore(nextHasMore);
    });
  }, [users, loading, page, totalCount, skip]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || skip) return;
    setPage((current) => current + 1);
  }, [hasMore, loading, skip]);

  const options = useMemo(
    () => allOwners.map((owner) => ({ value: owner.id, label: owner.name })),
    [allOwners],
  );

  return { owners: allOwners, options, loading, hasMore, loadMore };
}
