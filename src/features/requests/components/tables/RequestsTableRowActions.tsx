"use client";

import { CheckCheck, Eye } from "lucide-react";
import { useState } from "react";

import { REQUEST_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useContactUsMutations } from "@/features/requests/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { TableRowActionsTrigger } from "@/shared/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";

import { ResolveRequestDialog } from "../dialogs";

import type { ContactUsRequest } from "../../types";

type RequestsTableRowActionsProps = {
  request: ContactUsRequest;
};

export function RequestsTableRowActions({ request }: RequestsTableRowActionsProps) {
  const t = useTranslations("requests");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const { markResolved, markingResolved } = useContactUsMutations();
  const [resolveOpen, setResolveOpen] = useState(false);

  const canUpdate = can(REQUEST_PERMISSIONS.update);
  const showResolve = canUpdate && request.status === "pending";

  async function handleResolve() {
    try {
      await markResolved(request.id);
      toast.success(t("requestResolved"));
    } catch (error) {
      handleError(error, { context: { feature: "requests", action: "markResolved" } });
      throw error;
    }
  }

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel", { name: request.customerName })} />
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem asChild>
            <Link href={routes.requestsDetail(request.id)}>
              <Eye className="size-4" />
              {t("actionViewDetails")}
            </Link>
          </DropdownMenuItem>
          {showResolve ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setResolveOpen(true);
              }}
            >
              <CheckCheck className="size-4" />
              {t("actionResolve")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {showResolve ? (
        <ResolveRequestDialog
          open={resolveOpen}
          onOpenChange={setResolveOpen}
          customerName={request.customerName}
          email={request.email}
          loading={markingResolved}
          onConfirm={handleResolve}
        />
      ) : null}
    </>
  );
}
