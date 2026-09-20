import type { User } from "firebase/auth";

/**
 * Credentials accepted by email/password login.
 */
export type LoginCredentials = {
  email: string;
  password: string;
};

/**
 * Session snapshot returned after a successful authentication refresh.
 */
export type AuthSession = {
  user: User;
  idToken: string;
  expiresAt: number | null;
};

export type { User as FirebaseUser };
