"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { routes } from "@/constants/routes";
import { useInfiniteRoles } from "@/features/roles/services";
import { useRequiredFieldMessage } from "@/hooks/use-required-field-message";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import { usePhoneCountry } from "@/providers/phone-country";
import { useFileStorage } from "@/services/firebase/storage";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  Form,
  FormField,
  Input,
  InternationalPhoneInput,
  MultiSelect,
  PageHeader,
  Spinner,
} from "@/shared/components";
import { isValidInternationalPhone } from "@/shared/utils";

import { useStaffPermissions } from "../../hooks";
import { useCreateStaff, useStaffMember, useUpdateStaff } from "../../services";

import type { StaffAssignedRole } from "../../types";
import type { MultiSelectOption } from "@/shared/components";
import type { UserAvatarInput } from "@/shared/graphql/mutations/user-update";

type StaffFormMode = "create" | "edit";

type StaffFormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  roleIds: string[];
  avatar: UserAvatarInput | null;
};

type StaffFormProps = {
  mode: StaffFormMode;
  /** Required in edit mode — the form fetches the staff record itself. */
  staffId?: string;
};

type ProfilePhotoFieldProps = {
  value: UserAvatarInput | null;
  onChange: (avatar: UserAvatarInput | null) => void;
};

function ProfilePhotoField({ value, onChange }: ProfilePhotoFieldProps) {
  const t = useTranslations("staff");
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = value?.publicUrl ?? null;
  const storage = useFileStorage({ entityLabel: t("profilePhotoTitle") });

  const handleFileChange = async (file: File | null | undefined) => {
    if (!file) return;

    const existingPath = value?.privateUrl || value?.publicUrl || undefined;
    const result = existingPath
      ? await storage.replace({
          module: "staff",
          folder: "profilePhotos",
          existingPath,
          file,
        })
      : await storage.upload({
          module: "staff",
          folder: "profilePhotos",
          file,
        });
    if (!result) return;

    onChange({
      id: value?.id ?? "",
      name: file.name,
      new: true,
      privateUrl: result.path,
      publicUrl: result.downloadUrl,
      sizeInBytes: result.size,
    });
  };

  const handleRemove = async () => {
    const path = value?.privateUrl || value?.publicUrl;
    if (path) {
      await storage.remove(path);
    }
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-16">
          <AvatarImage src={previewUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-muted text-muted-foreground">
            <ImageOff className="size-5" />
          </AvatarFallback>
        </Avatar>
        {storage.uploading || storage.replacing ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Spinner size="sm" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{t("profilePhotoTitle")}</span>
        <span className="text-xs text-muted-foreground">{t("profilePhotoHint")}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={(event) => void handleFileChange(event.target.files?.[0])}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="link"
            className="h-auto w-fit p-0"
            disabled={storage.busy}
            onClick={() => inputRef.current?.click()}
          >
            {t("profilePhotoUpload")}
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="link"
              className="h-auto w-fit p-0 text-destructive"
              disabled={storage.busy}
              onClick={() => void handleRemove()}
            >
              {t("profilePhotoRemove")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StaffForm({ mode, staffId }: StaffFormProps) {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const requiredMessage = useRequiredFieldMessage();
  const defaultCountryCode = usePhoneCountry();
  const { canCreate, canUpdate } = useStaffPermissions();
  const { createStaff, loading: creating } = useCreateStaff();
  const { updateStaff, loading: updating } = useUpdateStaff();

  const { formInitialData, loading: staffLoading } = useStaffMember({
    id: staffId ?? "",
    skip: mode !== "edit" || !staffId,
  });

  const [roleSearch, setRoleSearch] = useState("");
  const {
    options: roleOptions,
    loading: rolesLoading,
    hasMore: rolesHasMore,
    loadMore: loadMoreRoles,
  } = useInfiniteRoles({ search: roleSearch });

  const selectedRoleOptions = useMemo<MultiSelectOption[]>(
    () =>
      (formInitialData?.roles ?? []).map((role: StaffAssignedRole) => ({
        value: role.id,
        label: role.name,
      })),
    [formInitialData],
  );

  const schema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().min(1, requiredMessage(t("fieldFullName"))),
          email: z
            .string()
            .min(1, requiredMessage(t("fieldEmail")))
            .email(),
          phoneNumber: z.string().min(1, requiredMessage(t("fieldPhone"))),
          countryCode: z.string().min(1, requiredMessage(t("fieldPhone"))),
          roleIds: z.array(z.string()).min(1, requiredMessage(t("fieldAssignedRoles"))),
          avatar: z.custom<UserAvatarInput | null>(
            (value) => value === null || typeof value === "object",
          ),
        })
        .superRefine((values, ctx) => {
          if (
            values.phoneNumber &&
            !isValidInternationalPhone(values.countryCode, values.phoneNumber)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["phoneNumber"],
              message: tCommon("internationalPhoneInvalidError"),
            });
          }
        }),
    [requiredMessage, t, tCommon],
  );

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      countryCode: defaultCountryCode,
      roleIds: [],
      avatar: null,
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !formInitialData) return;

    form.reset({
      fullName: formInitialData.fullName,
      email: formInitialData.email,
      phoneNumber: formInitialData.phoneNumber,
      countryCode: formInitialData.countryCode,
      roleIds: formInitialData.roleIds,
      avatar: formInitialData.avatar,
    });
  }, [form, formInitialData, mode]);

  const countryCode = useWatch({ control: form.control, name: "countryCode" });

  const allowed = mode === "edit" ? canUpdate : canCreate;
  const pageTitle = mode === "edit" ? t("editPageTitle") : t("createPageTitle");
  const pageDescription = mode === "edit" ? t("editPageDescription") : t("createPageDescription");
  const submitLabel = mode === "edit" ? t("editAction") : t("createAction");
  const footerNote = mode === "edit" ? t("editFooterNote") : t("createFooterNote");
  const disabling = mode === "edit" && staffLoading;

  const onSubmit = async (values: StaffFormValues) => {
    if (mode === "edit") {
      if (!staffId) return;

      const updated = await updateStaff({
        id: staffId,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        countryCode: values.countryCode,
        roleIds: values.roleIds,
        avatar: values.avatar,
      });
      if (!updated) return;

      router.push(routes.usersStaffMember(staffId));
      return;
    }

    const created = await createStaff({
      name: values.fullName,
      email: values.email,
      phone: values.phoneNumber,
      countryCode: values.countryCode,
      roleIds: values.roleIds,
      avatar: values.avatar,
    });
    if (!created) return;

    router.push(routes.usersStaff);
  };

  if (!allowed) {
    return null;
  }

  if (mode === "edit" && !staffLoading && !formInitialData) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <PageHeader
          title={pageTitle}
          description={pageDescription}
          actions={
            <>
              <Button
                type="submit"
                loading={creating || updating}
                disabled={creating || updating || disabling}
              >
                {submitLabel}
              </Button>
              <Button
                type="button"
                variant="outline-invert"
                onClick={() => router.push(routes.usersStaff)}
              >
                {tCommon("cancel")}
              </Button>
            </>
          }
        />

        <Card>
          <CardContent className="flex flex-col gap-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("staffInformationTitle")}
            </h2>

            <FormField
              control={form.control}
              name="avatar"
              render={(field) => (
                <ProfilePhotoField value={field.value} onChange={field.onChange} />
              )}
            />

            <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                label={t("fieldFullName")}
                required
                render={(field) => <Input {...field} placeholder={t("fieldFullNamePlaceholder")} />}
              />
              <FormField
                control={form.control}
                name="roleIds"
                label={t("fieldAssignedRoles")}
                required
                render={(field) => (
                  <MultiSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    items={roleOptions}
                    placeholder={
                      rolesLoading ? tCommon("loading") : t("fieldAssignedRolesPlaceholder")
                    }
                    loading={rolesLoading}
                    hasMore={rolesHasMore}
                    onLoadMore={loadMoreRoles}
                    onSearchChange={setRoleSearch}
                    selectedOptions={selectedRoleOptions}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="email"
                label={t("fieldEmail")}
                required
                render={(field) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder={t("fieldEmailPlaceholder")}
                    disabled={mode === "edit"}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                label={t("fieldPhone")}
                required
                render={(field, fieldState) => (
                  <InternationalPhoneInput
                    name={field.name}
                    value={{
                      countryCode: countryCode || defaultCountryCode,
                      phone: field.value,
                    }}
                    onBlur={field.onBlur}
                    onChange={({ countryCode: nextCountry, phone }) => {
                      form.setValue("countryCode", nextCountry, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      field.onChange(phone);
                    }}
                    placeholder={t("fieldPhonePlaceholder")}
                    aria-invalid={fieldState.invalid || undefined}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">{footerNote}</p>
      </form>
    </Form>
  );
}

export { StaffForm };
export type { StaffFormMode, StaffFormProps };
