"use client";

import Image from "next/image";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useIsClient } from "../hooks/use-is-client";

import { useLandingMotion } from "./LandingMotion";

type HeroMotionProps = {
  children: ReactNode;
  className?: string;
  /** Classes applied once splash motion is ready */
  readyClassName?: string;
};

/**
 * Client island: hides until hydrated + splash ready, then applies entrance classes.
 * SSR keeps children visible (no opacity-0) for crawlers.
 */
export function HeroMotion({ children, className, readyClassName }: HeroMotionProps) {
  const { ready } = useLandingMotion();
  const mounted = useIsClient();
  const hideUntilReady = mounted && !ready;

  return (
    <div className={cn(className, hideUntilReady && "opacity-0", ready && readyClassName)}>{children}</div>
  );
}

type HeroBackgroundProps = {
  alt: string;
};

export function HeroBackground({ alt }: HeroBackgroundProps) {
  const { ready } = useLandingMotion();

  return (
    <Image
      src="/images/hero.webp"
      alt={alt}
      fill
      priority
      sizes="100vw"
      className={cn("object-cover object-center", ready && "animate-hero-ken")}
    />
  );
}
