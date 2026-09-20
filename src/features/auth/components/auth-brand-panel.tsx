"use client";

import Image from "next/image";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type AuthBrandPanelProps = {
  className?: string;
};

export function AuthBrandPanel({ className }: AuthBrandPanelProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <aside
      className={cn(
        "relative hidden h-svh w-5/12 shrink-0 flex-col items-center justify-center overflow-hidden bg-primary px-8 lg:flex xl:px-12 opacity-95",
        className,
      )}
    >
      {logoFailed ? (
        <div className="text-center text-primary-foreground">
          <p className="font-display text-4xl font-semibold tracking-tight xl:text-5xl">Niche™</p>
          <p className="mt-2 font-display text-2xl xl:text-3xl">Society</p>
        </div>
      ) : (
        <Image
          src={siteConfig.logos.large}
          alt={siteConfig.name}
          width={320}
          height={120}
          priority
          className="h-auto w-full max-w-70 object-contain brightness-0 invert xl:max-w-80"
          style={{ width: "auto", height: "auto" }}
          onError={() => setLogoFailed(true)}
        />
      )}
    </aside>
  );
}
