"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useIsClient } from "../hooks/use-is-client";

import { useLandingMotion } from "./LandingMotion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms once revealed */
  delay?: number;
  variant?: "rise" | "scale";
};

/**
 * Scroll reveal wrapper. SSR / first paint keeps content visible for crawlers;
 * opacity-0 only applies after mount until the section enters the viewport.
 */
export function Reveal({ children, className, delay = 0, variant = "rise" }: RevealProps) {
  const { ready } = useLandingMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useIsClient();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready || !mounted) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ready, mounted]);

  return (
    <div
      ref={ref}
      className={cn(
        mounted && !visible && "opacity-0",
        visible && (variant === "scale" ? "animate-landing-reveal-scale" : "animate-landing-reveal"),
        className,
      )}
      style={visible && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
