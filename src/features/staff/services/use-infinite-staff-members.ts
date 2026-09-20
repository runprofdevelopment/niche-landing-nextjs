"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { useStaffMembers } from "./use-staff-members";

import type { StaffUserFilterInput } from "../graphql";

const PAGE_SIZE = 20;

type UseInfiniteStaffMembersOptions = {
  filters?: StaffUserFilterInput | undefined;
  skip?: boolean;
  search?: string;
};

function useInfiniteStaffMembers({ filters, skip, search }: UseInfiniteStaffMembersOptions = {}) {
  const [page, setPage] = useState(1);
  const [allStaff, setAllStaff] = useState<ReturnType<typeof useStaffMembers>["staff"]>([]);
  const [hasMore, setHasMore] = useState(true);

  const mergedFilters = useMemo<StaffUserFilterInput | undefined>(() => {
    const next: StaffUserFilterInput = { ...(filters ?? {}) };
    if (search?.trim()) {
      next.fullName = search.trim();
    }
    return Object.keys(next).length > 0 ? next : undefined;
  }, [filters, search]);

  const filtersKey = JSON.stringify(mergedFilters ?? null);
  useEffect(() => {
    startTransition(() => {
      setPage(1);
      setAllStaff([]);
      setHasMore(true);
    });
  }, [filtersKey]);

  const { staff, totalCount, loading } = useStaffMembers({
    filters: mergedFilters,
    limit: PAGE_SIZE,
    pageNumber: page,
    skip,
  });

  useEffect(() => {
    if (loading || skip) return;

    const nextHasMore = staff.length >= PAGE_SIZE && page * PAGE_SIZE < totalCount;

    startTransition(() => {
      setAllStaff((prev) => {
        if (page === 1) return staff;
        const existingIds = new Set(prev.map((member) => member.id));
        const next = staff.filter((member) => !existingIds.has(member.id));
        return next.length > 0 ? [...prev, ...next] : prev;
      });
      setHasMore(nextHasMore);
    });
  }, [staff, loading, page, totalCount, skip]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || skip) return;
    setPage((current) => current + 1);
  }, [hasMore, loading, skip]);

  const options = useMemo(
    () => allStaff.map((member) => ({ value: member.id, label: member.name })),
    [allStaff],
  );

  return { staff: allStaff, options, loading, hasMore, loadMore };
}

export { useInfiniteStaffMembers };
