"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { REQUEST_PERMISSIONS } from "@/constants/permissions";
import { useContactUsCommentsQuery, useContactUsMutations } from "@/features/requests/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from "@/shared/components";
import { toast } from "@/shared/components/feedback/toast";

import type { ContactUsComment } from "../types";

type RequestCommentsSectionProps = {
  contactUsId: string;
};

function formatCommentDate(value: string, emptyValue: string): string {
  if (!value) return emptyValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CommentItem({
  comment,
  canUpdate,
  onSave,
}: {
  comment: ContactUsComment;
  canUpdate: boolean;
  onSave: (commentId: string, text: string) => Promise<void>;
}) {
  const t = useTranslations("requests");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.comment);
  const [saving, setSaving] = useState(false);

  const author = comment.employee?.fullName || comment.createdBy || t("emptyValue");

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await onSave(comment.id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{author}</span>
          <span className="text-muted-foreground">
            {formatCommentDate(comment.createdAt, t("emptyValue"))}
          </span>
        </div>
        {canUpdate && !editing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(comment.comment);
              setEditing(true);
            }}
          >
            <Pencil className="size-3.5" />
            {t("editComment")}
          </Button>
        ) : null}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!draft.trim() || saving}
              onClick={() => {
                void handleSave();
              }}
            >
              {t("saveComment")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{comment.comment}</p>
      )}
    </div>
  );
}

export function RequestCommentsSection({ contactUsId }: RequestCommentsSectionProps) {
  const t = useTranslations("requests");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const { comments, loading } = useContactUsCommentsQuery({ contactUsId });
  const { createComment, updateComment, creatingComment } = useContactUsMutations();
  const [draft, setDraft] = useState("");
  const canUpdate = can(REQUEST_PERMISSIONS.update);

  async function handlePost() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    try {
      await createComment(contactUsId, trimmed);
      setDraft("");
      toast.success(t("commentPosted"));
    } catch (error) {
      handleError(error, { context: { feature: "requests", action: "createComment" } });
    }
  }

  async function handleUpdate(commentId: string, text: string) {
    try {
      await updateComment(commentId, text);
      toast.success(t("commentUpdated"));
    } catch (error) {
      handleError(error, { context: { feature: "requests", action: "updateComment" } });
      throw error;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <CardTitle className="text-lg">{t("commentsTitle")}</CardTitle>
        <Badge variant="secondary">{comments.length}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {comments.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground">{t("commentsEmpty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canUpdate={canUpdate}
                onSave={handleUpdate}
              />
            ))}
          </div>
        )}

        {canUpdate ? (
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("commentPlaceholder")}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!draft.trim() || creatingComment}
                onClick={() => {
                  void handlePost();
                }}
              >
                {t("postComment")}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
