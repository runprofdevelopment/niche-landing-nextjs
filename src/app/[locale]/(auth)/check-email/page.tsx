import { Suspense } from "react";

import { CheckEmailForm } from "@/features/auth/components/check-email-form";

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <CheckEmailForm />
    </Suspense>
  );
}
