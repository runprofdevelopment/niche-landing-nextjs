"use client";

import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import { apolloDefaultOptions } from "@/config/apollo";
import { env, isGraphqlMocksEnabled } from "@/config/env";
import { defaultLocale, locales, type Locale } from "@/config/i18n";
import { mockLink } from "@/lib/apollo/mock-link";
// import { getFirebaseAuth } from "@/services/firebase/auth";
// import { isFirebaseConfigured } from "@/config/env";

import type { ApolloLink } from "@apollo/client";

const httpLink = new HttpLink({ uri: env.apolloUri });

function resolveAcceptLanguage(): Locale {
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang;
    if ((locales as readonly string[]).includes(htmlLang)) {
      return htmlLang as Locale;
    }
    const segment = window.location.pathname.split("/").filter(Boolean)[0];
    if (segment && (locales as readonly string[]).includes(segment)) {
      return segment as Locale;
    }
  }
  return defaultLocale;
}

const authLink = setContext(async (_, { headers }) => {
  const nextHeaders: Record<string, string> = {
    ...headers,
    "X-App-Type": env.appType,
    "Accept-Language": resolveAcceptLanguage(),
  };

  // Landing: no Authorization token for now.
  // if (!isFirebaseConfigured()) {
  //   return { headers: nextHeaders };
  // }
  //
  // try {
  //   const auth = getFirebaseAuth();
  //   const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  //   if (token) {
  //     nextHeaders["Authorization"] = `Bearer ${token}`;
  //   }
  // } catch {
  //   // Keep request headers without a token when Firebase is unavailable.
  // }

  return { headers: nextHeaders };
});

export function createApolloClient() {
  const terminalLink: ApolloLink = isGraphqlMocksEnabled() ? mockLink : httpLink;
  const link: ApolloLink = from([authLink, terminalLink]);

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    defaultOptions: apolloDefaultOptions,
  });
}

export const apolloClient = createApolloClient();
