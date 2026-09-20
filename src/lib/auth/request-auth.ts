"use client";

import { isFirebaseConfigured } from "@/config/env";
import { getFirebaseAuth } from "@/services/firebase/auth";

/**
 * Returns an `Authorization` header value for authenticated API calls,
 * or `null` when the user is signed out / Firebase is not configured.
 */
export async function getAuthorizationHeader(): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    return `Bearer ${token}`;
  } catch {
    return null;
  }
}
