import { env } from "@/config/env";

export const apolloDefaultOptions = {
  watchQuery: { fetchPolicy: "cache-and-network" as const },
  query: { fetchPolicy: "cache-first" as const },
};

export const apolloUriFallback = "http://localhost:4000/graphql";

/** Absolute GraphQL HTTP endpoint (also used to derive sibling REST paths like `/storage`). */
export const graphqlEndpoint = env.apolloUri || apolloUriFallback;
