"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { routes } from "@/constants/routes";
import { useRequiredFieldMessage } from "@/hooks/useRequiredFieldMessage";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import {
  Button,
  Card,
  CardContent,
  Form,
  FormField,
  Input,
  PageHeader,
  Textarea,
} from "@/shared/components";

import { useRolePermissions } from "../../hooks";
import { useCreateRole, useRole, useRolePermissionGroups, useUpdateRole } from "../../services";

import { PermissionSelector } from "./permission-selector";

type RoleFormMode = "create" | "edit";

type RoleFormValues = {
  name: string;
  description: string;
  status: boolean;
};

type RoleFormProps = {
  mode: RoleFormMode;
  roleId?: string;
};

function RoleForm({ mode, roleId }: RoleFormProps) {
  const t = useTranslations("roles");
  const router = useRouter();
  const requiredMessage = useRequiredFieldMessage();
  const { canCreate, canUpdate } = useRolePermissions();
  const { createRole, loading: createLoading } = useCreateRole();
  const { updateRole, loading: updateLoading } = useUpdateRole();
  const { formInitialData, loading: roleLoading } = useRole({
    id: roleId ?? "",
    skip: mode !== "edit" || !roleId,
  });
  const { modules, loading: permissionsLoading } = useRolePermissionGroups();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [permissionsError, setPermissionsError] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, requiredMessage(t("fieldRoleName"))),
        description: z.string(),
        status: z.boolean(),
      }),
    [requiredMessage, t],
  );

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      status: true,
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !formInitialData) return;

    form.reset({
      name: formInitialData.name,
      description: formInitialData.description,
      status: formInitialData.status === "active",
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrates local selection state once role data loads
    setSelectedKeys(new Set(formInitialData.permissionKeys));
  }, [form, formInitialData, mode]);

  const allowed = mode === "edit" ? canUpdate : canCreate;
  const pageTitle = mode === "edit" ? t("editPageTitle") : t("createPageTitle");
  const submitLabel = mode === "edit" ? t("editRoleAction") : t("createRoleAction");
  const submitting = createLoading || updateLoading;
  const disabling = permissionsLoading || (mode === "edit" && roleLoading);

  const onSubmit = async (values: RoleFormValues) => {
    if (selectedKeys.size === 0) {
      setPermissionsError(true);
      return;
    }
    setPermissionsError(false);

    const permissionKeys = Array.from(selectedKeys);
    const onDuplicateName = () => form.setError("name", { message: t("roleNameConflictError") });

    if (mode === "edit") {
      if (!roleId) return;

      const result = await updateRole(
        {
          id: roleId,
          name: values.name,
          description: values.description.trim() || null,
          permissionKeys,
        },
        { onDuplicateName },
      );

      if (result) {
        router.push(routes.usersRoles);
      }
      return;
    }

    const result = await createRole(
      {
        name: values.name,
        description: values.description.trim() || null,
        permissionKeys,
        status: values.status ? "active" : "inactive",
      },
      { onDuplicateName },
    );
    if (result) {
      router.push(routes.usersRoles);
    }
  };

  if (!allowed) {
    return null;
  }

  if (mode === "edit" && !roleLoading && !formInitialData) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <PageHeader
          title={pageTitle}
          actions={
            <Button type="submit" loading={submitting} disabled={disabling || submitting}>
              {submitLabel}
            </Button>
          }
        />

        <div>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">{t("roleDetailsTitle")}</h2>
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1">
                  <FormField
                    control={form.control}
                    name="name"
                    label={t("fieldRoleName")}
                    required
                    render={(field) => (
                      <Input
                        {...field}
                        disabled={disabling}
                        placeholder={t("fieldRoleNamePlaceholder")}
                      />
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  label={t("fieldDescription")}
                  render={(field) => (
                    <Textarea
                      {...field}
                      disabled={disabling}
                      placeholder={t("fieldDescriptionPlaceholder")}
                      className="min-h-28"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <PermissionSelector
              modules={modules}
              selectedIds={selectedKeys}
              onChange={(next) => {
                setSelectedKeys(next);
                if (next.size > 0) setPermissionsError(false);
              }}
              loading={permissionsLoading}
              disabled={disabling || submitting}
              error={permissionsError ? t("permissionsRequiredError") : undefined}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

export { RoleForm };
export type { RoleFormMode, RoleFormProps };
