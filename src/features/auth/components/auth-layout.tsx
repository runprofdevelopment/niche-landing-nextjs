"use client";

import { useEffect } from "react";

import { routes } from "@/constants/routes";
import { usePathname } from "@/providers/i18n";

import { AuthBrandPanel } from "./auth-brand-panel";
import { AuthHeader } from "./auth-header";

import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const spacious = pathname === routes.register || pathname.endsWith("/register");

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <AuthBrandPanel />
      <main className="auth-scroll relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <AuthHeader />
        <div
          className={
            spacious
              ? "flex min-h-full w-full justify-center px-4 pt-24 pb-10 sm:px-6 lg:px-10 xl:px-16"
              : "flex min-h-full w-full items-center justify-center px-4 pt-20 pb-10 sm:px-6 lg:px-10 xl:px-16"
          }
        >
          <div className={spacious ? "mx-auto mt-4 w-full sm:mt-6" : "mx-auto w-full"}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
