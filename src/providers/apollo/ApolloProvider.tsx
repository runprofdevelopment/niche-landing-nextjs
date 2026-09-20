"use client";

import { ApolloProvider as BaseApolloProvider } from "@apollo/client";

import { apolloClient } from "@/lib/apollo/client";

import type { ReactNode } from "react";

type ApolloProviderProps = {
  children: ReactNode;
};

export function ApolloProvider({ children }: ApolloProviderProps) {
  return <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>;
}

export { apolloClient };
