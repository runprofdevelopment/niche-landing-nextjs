"use client";

import { useRoleFindQuery } from "../graphql";

type UseRoleOptions = {
  id: string;
  skip?: boolean;
};

export function useRole(options: UseRoleOptions) {
  const { id, skip } = options;
  const { role, formInitialData, loading, error, refetch } = useRoleFindQuery({
    id,
    skip,
  });

  return { role, formInitialData, loading, error, refetch };
}
