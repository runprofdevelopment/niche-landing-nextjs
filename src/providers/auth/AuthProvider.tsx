"use client";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { isFirebaseConfigured } from "@/config/env";
import { ALL_PERMISSION_KEYS, type PermissionKey } from "@/constants/permissions";
import {
  fetchMeProfile,
  registerUserWithBackend,
  resendVerificationCode as resendVerificationCodeApi,
  type MeProfile,
  type RegisterUserInput,
} from "@/features/auth/services/auth-api";
import { getFirebaseAuth } from "@/services/firebase/auth";
// FCM not needed on this landing project — keep messaging helpers unused.
// import {
//   resetFcm,
//   setupFirebaseMessages,
//   teardownFirebaseMessages,
// } from "@/services/firebase/messaging";

/** Defer FCM so login → dashboard paint is not blocked by permission / SW work. */
// const FCM_DEFER_MS = 2500;

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  emailVerified: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  profile: MeProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True when staff profile is owner — bypasses permission checks. */
  isAdmin: boolean;
  /** Hydrated from profile.permissions (dev: all keys until BE wires RBAC). */
  permissions: Set<PermissionKey>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<MeProfile | null>;
  signUp: (input: RegisterUserInput & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshProfile: () => Promise<MeProfile | null>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email ?? "",
    displayName: user.displayName,
    emailVerified: user.emailVerified,
  };
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());

  const profileRef = useRef<MeProfile | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  const mePromiseRef = useRef<Promise<MeProfile | null> | null>(null);
  const meUidRef = useRef<string | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getIdToken = useCallback(async () => {
    if (!isFirebaseConfigured()) return null;
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  /**
   * Single-flight authMe for a Firebase user.
   * - Reuses an in-flight promise for the same uid (login + onAuthStateChanged).
   * - Skips network when profile for that uid is already in memory (unless `force`).
   * - Soft-fails: does not wipe an existing good profile on transient GraphQL errors.
   */
  const loadMeProfile = useCallback(async (firebaseUser: User, options?: { force?: boolean }) => {
    const uid = firebaseUser.uid;
    const force = options?.force === true;

    if (!force && mePromiseRef.current && meUidRef.current === uid) {
      return mePromiseRef.current;
    }

    if (!force && profileRef.current && userRef.current?.id === uid) {
      return profileRef.current;
    }

    meUidRef.current = uid;
    const pending: { current: Promise<MeProfile | null> | null } = { current: null };
    pending.current = (async (): Promise<MeProfile | null> => {
      try {
        const token = await firebaseUser.getIdToken();
        const nextProfile = await fetchMeProfile(token);

        if (nextProfile) {
          profileRef.current = nextProfile;
          setProfile(nextProfile);
          return nextProfile;
        }

        // Soft fail: keep existing profile for this uid if GraphQL returned null.
        if (userRef.current?.id === uid && profileRef.current) {
          return profileRef.current;
        }

        profileRef.current = null;
        setProfile(null);
        return null;
      } catch {
        if (userRef.current?.id === uid && profileRef.current) {
          return profileRef.current;
        }
        profileRef.current = null;
        setProfile(null);
        return null;
      } finally {
        if (mePromiseRef.current === pending.current) {
          mePromiseRef.current = null;
        }
      }
    })();

    mePromiseRef.current = pending.current;
    return pending.current;
  }, []);

  const refreshProfile = useCallback(
    async (options?: { force?: boolean }) => {
      if (!isFirebaseConfigured()) {
        setProfile(null);
        return null;
      }
      const auth = getFirebaseAuth();
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        profileRef.current = null;
        setProfile(null);
        return null;
      }
      return loadMeProfile(firebaseUser, options);
    },
    [loadMeProfile],
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // resetFcm();
        mePromiseRef.current = null;
        meUidRef.current = null;
        userRef.current = null;
        profileRef.current = null;
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const nextUser = mapFirebaseUser(firebaseUser);
      userRef.current = nextUser;
      setUser(nextUser);

      try {
        // Shares in-flight / cached result with signIn → refreshProfile (A1).
        await loadMeProfile(firebaseUser);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [loadMeProfile]);

  // FCM disabled for landing — no push permission / SW registration here.
  // // A2: defer FCM until after first paint / idle so login redirect is not blocked.
  // useEffect(() => {
  //   if (!user || isLoading) return;
  //
  //   let cancelled = false;
  //   let timeoutId: ReturnType<typeof setTimeout> | undefined;
  //   let idleId: number | undefined;
  //
  //   const run = () => {
  //     if (cancelled) return;
  //     void setupFirebaseMessages();
  //   };
  //
  //   if (typeof window !== "undefined" && "requestIdleCallback" in window) {
  //     idleId = window.requestIdleCallback(run, { timeout: FCM_DEFER_MS });
  //   } else {
  //     timeoutId = setTimeout(run, FCM_DEFER_MS);
  //   }
  //
  //   return () => {
  //     cancelled = true;
  //     if (timeoutId) clearTimeout(timeoutId);
  //     if (idleId != null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
  //       window.cancelIdleCallback(idleId);
  //     }
  //   };
  //   // Intentionally keyed by uid — avoid re-deferring when user object identity changes.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps -- user.id
  // }, [user?.id, isLoading]);

  const signIn = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      const auth = getFirebaseAuth();
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const nextUser = mapFirebaseUser(credential.user);
      userRef.current = nextUser;
      setUser(nextUser);
      // Single authMe — onAuthStateChanged reuses this in-flight / cached result.
      return loadMeProfile(credential.user);
    },
    [loadMeProfile],
  );

  const signUp = useCallback(async (input: RegisterUserInput & { password: string }) => {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);

    try {
      if (input.fullName.trim()) {
        await updateProfile(credential.user, { displayName: input.fullName.trim() });
      }

      const token = await credential.user.getIdToken();
      await registerUserWithBackend(
        {
          fullName: input.fullName,
          email: input.email,
          countryCode: input.countryCode,
          phoneNumber: input.phoneNumber,
          department: input.department,
        },
        token,
      );

      // Stay signed in so verify-email can call APIs with the Bearer token.
      const nextUser = mapFirebaseUser(credential.user);
      userRef.current = nextUser;
      setUser(nextUser);
    } catch (error) {
      // Roll back the Firebase account if backend registration fails.
      try {
        await credential.user.delete();
      } catch {
        await firebaseSignOut(auth);
      }
      mePromiseRef.current = null;
      meUidRef.current = null;
      userRef.current = null;
      profileRef.current = null;
      setUser(null);
      setProfile(null);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      mePromiseRef.current = null;
      meUidRef.current = null;
      userRef.current = null;
      profileRef.current = null;
      setUser(null);
      setProfile(null);
      return;
    }
    // Remove device token while Bearer auth is still valid, then sign out.
    // await teardownFirebaseMessages();
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    mePromiseRef.current = null;
    meUidRef.current = null;
    userRef.current = null;
    profileRef.current = null;
    setUser(null);
    setProfile(null);
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      throw new Error("No authenticated user to verify.");
    }
    await resendVerificationCodeApi();
  }, []);

  const refreshProfileForContext = useCallback(
    () => refreshProfile({ force: true }),
    [refreshProfile],
  );

  const isOwner = profile?.profileType === "staff" && profile.isOwner === true;
  // Kept as `isAdmin` for existing consumers (`usePermissions`).
  const isAdmin = isOwner;

  const permissions = useMemo(() => {
    if (isOwner) {
      return new Set<PermissionKey>(ALL_PERMISSION_KEYS);
    }
    const fromProfile = profile?.permissions?.filter((key): key is PermissionKey =>
      (ALL_PERMISSION_KEYS as string[]).includes(key),
    );
    return new Set<PermissionKey>(fromProfile ?? []);
  }, [isOwner, profile?.permissions]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin,
      permissions,
      signIn,
      signUp,
      signOut,
      resendVerificationEmail,
      refreshProfile: refreshProfileForContext,
      getIdToken,
    }),
    [
      user,
      profile,
      isLoading,
      isAdmin,
      permissions,
      signIn,
      signUp,
      signOut,
      resendVerificationEmail,
      refreshProfileForContext,
      getIdToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider.");
  }
  return context;
}
