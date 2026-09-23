"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LandingMotionContextValue = {
  ready: boolean;
  markReady: () => void;
};

const LandingMotionContext = createContext<LandingMotionContextValue>({
  ready: false,
  markReady: () => undefined,
});

export function LandingMotionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const value = useMemo(() => ({ ready, markReady }), [ready, markReady]);

  return <LandingMotionContext.Provider value={value}>{children}</LandingMotionContext.Provider>;
}

export function useLandingMotion() {
  return useContext(LandingMotionContext);
}

/** Pause document scroll while the splash is visible. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
