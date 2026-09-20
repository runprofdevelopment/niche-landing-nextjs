"use client";

import { useEffect } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { Button } from "@/shared/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  const { handleError } = useErrorHandler();

  useEffect(() => {
    handleError(error, { channels: ["report"] });
  }, [error, handleError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("errorTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("errorDescription")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>{t("tryAgain")}</Button>
          <Button variant="outline" asChild>
            <Link href="/">{t("goHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
