"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { evaluatePasswordRules } from "@/shared/utils/password-rules";

type PasswordRequirementsProps = {
  password: string;
  className?: string;
};

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  const t = useTranslations("auth");
  const checks = evaluatePasswordRules(password);

  return (
    <ul className={cn("space-y-1 text-sm", className)}>
      {checks.map((rule) => (
        <li
          key={rule.id}
          className={cn(
            "flex items-center gap-2",
            rule.met ? "text-emerald-600" : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              rule.met ? "bg-emerald-600" : "bg-muted-foreground/60",
            )}
          />
          {t(rule.labelKey)}
        </li>
      ))}
    </ul>
  );
}
