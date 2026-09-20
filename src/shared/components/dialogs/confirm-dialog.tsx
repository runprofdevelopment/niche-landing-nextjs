"use client";

import { Check, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Field } from "@/shared/components/forms/field";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { InfiniteSelect } from "@/shared/components/ui/infinite-select";
import { Input } from "@/shared/components/ui/input";
import { MultiSelect } from "@/shared/components/ui/multi-select";
import { Textarea } from "@/shared/components/ui/textarea";

import type { ReactNode } from "react";

/** Text fields yield a string; multi-select fields yield the selected values. */
export type ConfirmFieldValues = Record<string, string | string[]>;

type ConfirmTone = "destructive" | "success" | "default";

type ConfirmInfoRow = {
  label: string;
  value: string;
};

type ConfirmSelectOption = {
  value: string;
  label: string;
};

type ConfirmFieldBase = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

type ConfirmTextareaField = ConfirmFieldBase & {
  type: "textarea";
};

type ConfirmSelectFieldBase = ConfirmFieldBase & {
  options: ConfirmSelectOption[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearchChange?: (search: string) => void;
};

type ConfirmInfiniteSelectField = ConfirmSelectFieldBase & {
  type: "infinite-select";
};

type ConfirmMultiSelectField = ConfirmSelectFieldBase & {
  type: "multi-select";
};

export type ConfirmDialogField =
  ConfirmTextareaField | ConfirmInfiniteSelectField | ConfirmMultiSelectField;

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tone?: ConfirmTone;
  icon?: ReactNode;
  contentClassName?: string;
  infoRows?: ConfirmInfoRow[];
  /** Optional content below info rows (e.g. QR preview). */
  children?: ReactNode;
  fields?: ConfirmDialogField[];
  cancelLabel: string;
  confirmLabel: string;
  confirmClassName?: string;
  loading?: boolean;
  /** When set, user must type this id before confirming (delete safety). */
  validateDeletion?: { id: string; module?: string };
  onConfirm: (values: ConfirmFieldValues) => void | Promise<void>;
};

const toneIcon = {
  destructive: Trash2,
  success: Check,
  default: Check,
} as const;

const toneIconWrap = {
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-active/30 text-active-foreground",
  default: "bg-muted text-foreground",
} as const;

const toneCancel = {
  destructive: "border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive",
  success: "border-active text-active-foreground hover:bg-active/20 hover:text-active-foreground",
  default: "",
} as const;

const toneConfirm = {
  destructive: undefined,
  success: "bg-active text-active-foreground hover:bg-active/90",
  default: undefined,
} as const;

function emptyFieldValues(fields: ConfirmDialogField[] | undefined): ConfirmFieldValues {
  const defaults: ConfirmFieldValues = {};
  for (const field of fields ?? []) {
    defaults[field.name] = field.type === "multi-select" ? [] : "";
  }
  return defaults;
}

function isFieldEmpty(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length === 0;
  return !(value ?? "").trim();
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  tone = "destructive",
  icon,
  contentClassName,
  infoRows,
  children,
  fields,
  cancelLabel,
  confirmLabel,
  confirmClassName,
  loading = false,
  validateDeletion,
  onConfirm,
}: ConfirmDialogProps) {
  const fieldsKey = (fields ?? []).map((field) => field.name).join("\0");
  const [values, setValues] = useState<ConfirmFieldValues>(() => emptyFieldValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmId, setConfirmId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSnapshot, setResetSnapshot] = useState({ open: false, fieldsKey });

  // Reset form when the dialog opens (or fields change while open) — during render.
  if (open && (!resetSnapshot.open || resetSnapshot.fieldsKey !== fieldsKey)) {
    setResetSnapshot({ open: true, fieldsKey });
    setValues(emptyFieldValues(fields));
    setErrors({});
    setConfirmId("");
    setSubmitting(false);
  } else if (!open && resetSnapshot.open) {
    setResetSnapshot({ open: false, fieldsKey });
  }

  const busy = loading || submitting;
  const Icon = toneIcon[tone];

  const deletionMismatch = useMemo(() => {
    if (!validateDeletion) return false;
    return confirmId.trim() !== validateDeletion.id;
  }, [confirmId, validateDeletion]);

  async function handleConfirm() {
    const nextErrors: Record<string, string> = {};
    for (const field of fields ?? []) {
      if (field.required && isFieldEmpty(values[field.name])) {
        nextErrors[field.name] = "Required";
      }
    }
    if (validateDeletion && confirmId.trim() !== validateDeletion.id) {
      nextErrors["__confirmId"] = "Mismatch";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onConfirm(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy && !next) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className={cn("max-w-md gap-6 sm:rounded-xl", contentClassName)}>
        <AlertDialogHeader className="items-center space-y-4 text-center sm:text-center">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-full",
              toneIconWrap[tone],
            )}
            aria-hidden
          >
            {icon ?? <Icon className="size-7" strokeWidth={1.75} />}
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-center text-xl font-semibold tracking-tight">
              {title}
            </AlertDialogTitle>
            {description ? (
              <AlertDialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
                {description}
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription className="sr-only">{title}</AlertDialogDescription>
            )}
          </div>
        </AlertDialogHeader>

        {infoRows && infoRows.length > 0 ? (
          <dl className="space-y-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-end font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {children}

        {fields && fields.length > 0 ? (
          <div className="space-y-4 text-start">
            {fields.map((field) => {
              if (field.type === "textarea") {
                return (
                  <Field
                    key={field.name}
                    label={field.label}
                    htmlFor={`confirm-field-${field.name}`}
                    {...(field.required ? { required: true } : {})}
                  >
                    <Textarea
                      id={`confirm-field-${field.name}`}
                      rows={4}
                      placeholder={field.placeholder}
                      value={(values[field.name] as string) ?? ""}
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [field.name]: event.target.value,
                        }))
                      }
                      className={cn(errors[field.name] && "border-destructive")}
                    />
                  </Field>
                );
              }

              if (field.type === "multi-select") {
                return (
                  <Field
                    key={field.name}
                    label={field.label}
                    {...(field.required ? { required: true } : {})}
                  >
                    <MultiSelect
                      value={(values[field.name] as string[]) ?? []}
                      onValueChange={(next) =>
                        setValues((previous) => ({
                          ...previous,
                          [field.name]: next,
                        }))
                      }
                      items={field.options}
                      {...(field.placeholder !== undefined
                        ? { placeholder: field.placeholder }
                        : {})}
                      {...(field.loading !== undefined ? { loading: field.loading } : {})}
                      {...(field.hasMore !== undefined ? { hasMore: field.hasMore } : {})}
                      {...(field.onLoadMore ? { onLoadMore: field.onLoadMore } : {})}
                      {...(field.onSearchChange ? { onSearchChange: field.onSearchChange } : {})}
                      className={cn(errors[field.name] && "border-destructive")}
                    />
                  </Field>
                );
              }

              return (
                <Field
                  key={field.name}
                  label={field.label}
                  {...(field.required ? { required: true } : {})}
                >
                  <InfiniteSelect
                    value={(values[field.name] as string) || null}
                    onValueChange={(next) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.name]: next ?? "",
                      }))
                    }
                    items={field.options}
                    {...(field.placeholder !== undefined ? { placeholder: field.placeholder } : {})}
                    {...(field.loading !== undefined ? { loading: field.loading } : {})}
                    {...(field.hasMore !== undefined ? { hasMore: field.hasMore } : {})}
                    {...(field.onLoadMore ? { onLoadMore: field.onLoadMore } : {})}
                    {...(field.onSearchChange ? { onSearchChange: field.onSearchChange } : {})}
                    className={cn(errors[field.name] && "border-destructive")}
                  />
                </Field>
              );
            })}
          </div>
        ) : null}

        {validateDeletion ? (
          <Field
            htmlFor="confirm-delete-id"
            label={
              <>
                Type <span className="font-mono">{validateDeletion.id}</span> to confirm
              </>
            }
          >
            <Input
              id="confirm-delete-id"
              value={confirmId}
              onChange={(event) => setConfirmId(event.target.value)}
              className={cn(errors["__confirmId"] && "border-destructive")}
            />
          </Field>
        ) : null}

        <AlertDialogFooter className="flex-row gap-3 sm:justify-stretch sm:space-x-0">
          <AlertDialogCancel
            disabled={busy}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-0 h-11 flex-1 bg-background",
              toneCancel[tone],
            )}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            loading={busy}
            disabled={deletionMismatch}
            className={cn("h-11 flex-1", toneConfirm[tone], confirmClassName)}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
