"use client";

import { Inbox } from "lucide-react";
import { useState } from "react";

import { REQUEST_PERMISSIONS } from "@/constants/permissions";
import {
  CONTACT_US_STATUS_BADGE_VARIANT,
  CONTACT_US_STATUS_LABEL_KEYS,
} from "@/features/requests/constants";
import { useContactUsMutations, useContactUsQuery } from "@/features/requests/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { Badge, Button, EmptyState, PageHeader, PermissionGate } from "@/shared/components";
import { toast } from "@/shared/components/feedback/toast";

import { ResolveRequestDialog, SendEmailDialog } from "../components/dialogs";
import { RequestAdditionalNotes } from "../components/RequestAdditionalNotes";
import { RequestCommentsSection } from "../components/RequestCommentsSection";
import { RequestEventDetails } from "../components/RequestEventDetails";
import { RequestRequesterInfo } from "../components/RequestRequesterInfo";

type RequestDetailsViewProps = {
  requestId: string;
};

export default function RequestDetailsView({ requestId }: RequestDetailsViewProps) {
  const t = useTranslations("requests");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const { request, loading } = useContactUsQuery({ id: requestId });
  const { markResolved, markingResolved } = useContactUsMutations();

  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  const canUpdate = can(REQUEST_PERMISSIONS.update);
  const isPending = request?.status === "pending";

  async function handleResolve() {
    if (!request) return;
    try {
      await markResolved(request.id);
      toast.success(t("requestResolved"));
    } catch (error) {
      handleError(error, { context: { feature: "requests", action: "markResolved" } });
      throw error;
    }
  }

  async function handleSendEmail() {
    // UI-only stub — backend integration comes later.
    toast.success(t("sendEmailSuccess"));
  }

  return (
    <PermissionGate permission={REQUEST_PERMISSIONS.view}>
      {loading && !request ? null : !request ? (
        <EmptyState icon={<Inbox />} title={t("requestNotFound")} />
      ) : (
        <div className="flex flex-col gap-6">
          <PageHeader
            title={
              <span className="flex flex-wrap items-center gap-3">
                {t("detailsTitle")}
                <Badge variant={CONTACT_US_STATUS_BADGE_VARIANT[request.status]} dot>
                  {t(CONTACT_US_STATUS_LABEL_KEYS[request.status])}
                </Badge>
              </span>
            }
            actions={
              <>
                <Button type="button" variant="outline" onClick={() => setSendEmailOpen(true)}>
                  {t("sendEmail")}
                </Button>
                {canUpdate && isPending ? (
                  <Button type="button" onClick={() => setResolveOpen(true)}>
                    {t("actionResolve")}
                  </Button>
                ) : null}
              </>
            }
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RequestRequesterInfo request={request} />
            <RequestEventDetails request={request} />
          </div>

          <RequestAdditionalNotes request={request} />

          <RequestCommentsSection contactUsId={request.id} />

          <SendEmailDialog
            open={sendEmailOpen}
            onOpenChange={setSendEmailOpen}
            email={request.email}
            onConfirm={handleSendEmail}
          />

          {canUpdate && isPending ? (
            <ResolveRequestDialog
              open={resolveOpen}
              onOpenChange={setResolveOpen}
              customerName={request.customerName}
              email={request.email}
              loading={markingResolved}
              onConfirm={handleResolve}
            />
          ) : null}
        </div>
      )}
    </PermissionGate>
  );
}
