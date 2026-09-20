"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useFrontDeskListQuery } from "@/features/security/graphql";
import { useStaffUserListQuery } from "@/features/staff/graphql";
import { useTranslations } from "@/hooks/useTranslations";
import { Form, FormField } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Select } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

import { eventStaffFormSchema } from "../../schemas/event-forms.schema";

import type { EventStaffRole } from "../../domain/event-staff";
import type { EventStaffFormValues } from "../../schemas/event-forms.schema";

export type AddEventStaffSubmit = {
  role: EventStaffRole;
  memberId: string;
  notes: string;
};

type AddEventStaffDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AddEventStaffSubmit) => void | Promise<void>;
  submitting?: boolean;
};

export function AddEventStaffDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: AddEventStaffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open ? (
          <AddEventStaffForm
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            submitting={submitting}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type AddEventStaffFormProps = {
  onSubmit: (values: AddEventStaffSubmit) => void | Promise<void>;
  onCancel: () => void;
  submitting: boolean;
};

function AddEventStaffForm({ onSubmit, onCancel, submitting }: AddEventStaffFormProps) {
  const t = useTranslations("events");

  const form = useForm<EventStaffFormValues>({
    resolver: zodResolver(eventStaffFormSchema),
    defaultValues: {
      kind: "",
      memberId: "",
      notes: "",
    },
  });

  const kind = useWatch({ control: form.control, name: "kind" }) ?? "";
  const loadStaff = kind === "staff";
  const loadFrontDesk = kind === "frontdesk";

  const { staff, loading: staffLoading } = useStaffUserListQuery({
    pagination: { limit: 100, page: 1 },
    skip: !loadStaff,
  });
  const { members: frontDeskMembers, loading: frontDeskLoading } = useFrontDeskListQuery({
    filters: { status: "active" },
    pagination: { limit: 100, page: 1 },
    skip: !loadFrontDesk,
  });

  const memberItems = useMemo(() => {
    if (kind === "staff") {
      return staff.map((member) => ({
        value: member.id,
        label: member.name,
      }));
    }
    if (kind === "frontdesk") {
      return frontDeskMembers.map((member) => ({
        value: member.id,
        label: member.name,
      }));
    }
    return [] as Array<{ value: string; label: string }>;
  }, [frontDeskMembers, kind, staff]);

  const membersLoading = (loadStaff && staffLoading) || (loadFrontDesk && frontDeskLoading);

  const handleSubmit = async (values: EventStaffFormValues) => {
    if (values.kind === "") return;
    await onSubmit({
      role: values.kind,
      memberId: values.memberId,
      notes: values.notes,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("addEventStaffTitle")}</DialogTitle>
        <DialogDescription>{t("addEventStaffDescription")}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 border-t border-border pt-6"
        >
          <FormField
            control={form.control}
            name="kind"
            label={t("columnRole")}
            required
            render={(field) => (
              <Select
                searchable={false}
                value={field.value}
                placeholder={t("selectRolePlaceholder")}
                onValueChange={(value) => {
                  field.onChange(value ?? "");
                  form.setValue("memberId", "", { shouldValidate: false });
                }}
                items={[
                  { value: "staff", label: t("roleStaff") },
                  { value: "frontdesk", label: t("roleFrontDesk") },
                ]}
              />
            )}
          />

          <FormField
            control={form.control}
            name="memberId"
            label={t("staffMemberLabel")}
            required
            render={(field) => (
              <Select
                value={field.value}
                disabled={kind === "" || membersLoading}
                placeholder={
                  kind === ""
                    ? t("selectRoleFirst")
                    : membersLoading
                      ? t("loadingMembers")
                      : memberItems.length === 0
                        ? t("allMembersAssigned")
                        : t("selectMemberPlaceholder")
                }
                onValueChange={(value) => field.onChange(value ?? "")}
                items={memberItems}
              />
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            label={t("notes")}
            render={(field) => <Textarea {...field} rows={3} placeholder={t("notesPlaceholder")} />}
          />

          <DialogFooter className="border-t border-border pt-6">
            <Button type="button" variant="outline-invert" onClick={onCancel} disabled={submitting}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("addingStaff") : t("addStaff")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
