/**
 * Normalize a public env value (strip accidental surrounding quotes).
 * IMPORTANT: Callers must pass `process.env['NEXT_PUBLIC_*']` as a static
 * string key so Next.js can inline it into the client bundle.
 * Dynamic `process.env[key]` is empty in the browser.
 */
function normalizeEnv(value: string | undefined, fallback = ""): string {
  if (value == null || value === "") return fallback;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

const graphqlEndpoint = normalizeEnv(
  process.env["NEXT_PUBLIC_GRAPHQL_ENDPOINT"],
  normalizeEnv(process.env["NEXT_PUBLIC_APOLLO_URI"], "http://localhost:4000/graphql"),
);

export const env = {
  apolloUri: graphqlEndpoint,
  /**
   * When true, Apollo uses the in-memory mock link instead of HTTP.
   * Default false so local `.env` can hit the real staging API.
   * Set `NEXT_PUBLIC_GRAPHQL_MOCKS=true` to force mocks.
   */
  graphqlMocks: normalizeEnv(process.env["NEXT_PUBLIC_GRAPHQL_MOCKS"], "false"),
  firebase: {
    apiKey: normalizeEnv(process.env["NEXT_PUBLIC_FIREBASE_API_KEY"]),
    authDomain: normalizeEnv(process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"]),
    projectId: normalizeEnv(process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]),
    storageBucket: normalizeEnv(process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"]),
    messagingSenderId: normalizeEnv(process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"]),
    appId: normalizeEnv(process.env["NEXT_PUBLIC_FIREBASE_APP_ID"]),
    /**
     * Web Push VAPID key (Firebase Console → Cloud Messaging → Web Push certificates).
     * Staging: BIPSM_mkj0v29CDEpwLwec7ObUHmoq69pgfW_q4Z36LErbfoQDXM7u1s-meLpXimHaJcX4emK_BeZQ9ZaeDEXKE
     * Production: BGJe40fCDDrUE0xaI14yaQaw1aBEZos4qnPNY9yj9_z-WlIWmt-6aeVg2E-0mRFVqTIp8oXsnq6IzDWIq9hH36c
     */
    messagingKey: normalizeEnv(process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_KEY"]),
  },
  /** Sent on every GraphQL request as `X-App-Type`. */
  appType: "guest" as const,
  sentryDsn: normalizeEnv(process.env["NEXT_PUBLIC_SENTRY_DSN"]),
  isDev: process.env.NODE_ENV === "development",
} as const;

export function isFirebaseConfigured(): boolean {
  return Boolean(env.firebase.apiKey && env.firebase.projectId);
}

export function isGraphqlMocksEnabled(): boolean {
  return env.graphqlMocks === "true" || env.graphqlMocks === "1";
}
