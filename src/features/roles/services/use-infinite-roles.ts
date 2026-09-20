"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { useRoles } from "./use-roles";

import type { RoleFilterInput } from "../graphql";

const PAGE_SIZE = 20;

type UseInfiniteRolesOptions = {
  filters?: RoleFilterInput | undefined;
  skip?: boolean;
  search?: string;
};

function useInfiniteRoles({ filters, skip, search }: UseInfiniteRolesOptions = {}) {
  const [page, setPage] = useState(1);
  const [allRoles, setAllRoles] = useState<ReturnType<typeof useRoles>["roles"]>([]);
  const [hasMore, setHasMore] = useState(true);

  const mergedFilters = useMemo<RoleFilterInput | undefined>(() => {
    const next: RoleFilterInput = { ...(filters ?? {}) };
    if (search?.trim()) {
      next.name = search.trim();
    }
    return Object.keys(next).length > 0 ? next : undefined;
  }, [filters, search]);

  const filtersKey = JSON.stringify(mergedFilters ?? null);
  useEffect(() => {
    startTransition(() => {
      setPage(1);
      setAllRoles([]);
      setHasMore(true);
    });
  }, [filtersKey]);

  const { roles, totalCount, loading } = useRoles({
    filters: mergedFilters,
    limit: PAGE_SIZE,
    pageNumber: page,
    skip,
  });

  useEffect(() => {
    if (loading || skip) return;

    const nextHasMore = roles.length >= PAGE_SIZE && page * PAGE_SIZE < totalCount;

    startTransition(() => {
      setAllRoles((prev) => {
        if (page === 1) return roles;
        const existingIds = new Set(prev.map((role) => role.id));
        const next = roles.filter((role) => !existingIds.has(role.id));
        return next.length > 0 ? [...prev, ...next] : prev;
      });
      setHasMore(nextHasMore);
    });
  }, [roles, loading, page, totalCount, skip]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || skip) return;
    setPage((current) => current + 1);
  }, [hasMore, loading, skip]);

  const options = useMemo(
    () => allRoles.map((role) => ({ value: role.id, label: role.name })),
    [allRoles],
  );

  return { roles: allRoles, options, loading, hasMore, loadMore };
}

export { useInfiniteRoles };
