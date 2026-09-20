import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-lg rounded-xl border border-border/80 bg-card px-6 py-8 shadow-sm sm:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AuthCardHeaderProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
};

export function AuthCardHeader({ icon, title, description }: AuthCardHeaderProps) {
  return (
    <div className="mb-6 text-center">
      {icon ? (
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

type AuthCardFooterProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCardFooter({ children, className }: AuthCardFooterProps) {
  return (
    <p className={cn("mt-6 text-center text-sm text-muted-foreground", className)}>{children}</p>
  );
}
