"use client";

/**
 * Placeholder branches API used by staff form/view until the branches feature
 * is properly ported. Returns an empty option list so components render.
 */

type UseInfiniteBranchesOptions = {
  filters?: unknown;
  search?: string;
  skip?: boolean;
};

export type BranchOption = { value: string; label: string };

export function useInfiniteBranches(_options: UseInfiniteBranchesOptions = {}): {
  options: BranchOption[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  branches: BranchOption[];
} {
  return {
    options: [],
    branches: [],
    loading: false,
    hasMore: false,
    loadMore: () => {},
  };
}
