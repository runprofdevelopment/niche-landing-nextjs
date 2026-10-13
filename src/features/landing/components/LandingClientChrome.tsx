"use client";


import { LandingMotionProvider } from "./LandingMotion";
import { LandingSplash } from "./LandingSplash";

import type { ReactNode } from "react";

/**
 * Client boundary for splash + motion context.
 * Server-rendered section HTML is passed as `children` for crawlable SSR.
 */
export function LandingClientChrome({ children }: { children: ReactNode }) {
  return (
    <LandingMotionProvider>
      <LandingSplash />
      {children}
    </LandingMotionProvider>
  );
}
