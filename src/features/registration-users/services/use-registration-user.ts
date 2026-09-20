"use client";

import { useGuestUserFindQuery } from "../graphql";

type UseRegistrationUserOptions = {
  id: string;
  skip?: boolean;
};

export function useRegistrationUser(options: UseRegistrationUserOptions) {
  const { details, loading, error, refetch } = useGuestUserFindQuery(options);

  return {
    user: details,
    loading,
    error,
    refetch,
  };
}
