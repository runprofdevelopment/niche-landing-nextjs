"use client";

import { CheckCheck, MoreVertical, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SearchInput,
  Spinner,
} from "@/shared/components";

import type { PermissionModule } from "../../types";

type PermissionSelectorProps = {
  modules: PermissionModule[];
  selectedIds: Set<string>;
  onChange: (next: Set<string>) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string | undefined;
};

function PermissionSelector({
  modules,
  selectedIds,
  onChange,
  loading = false,
  disabled = false,
  error,
}: PermissionSelectorProps) {
  const t = useTranslations("roles");
  const [search, setSearch] = useState("");

  const allIds = useMemo(
    () => modules.flatMap((module) => module.permissions.map((permission) => permission.id)),
    [modules],
  );

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return modules;
    return modules.filter((module) => module.name.toLowerCase().includes(query));
  }, [modules, search]);

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(next);
  };

  const setModule = (module: PermissionModule, selected: boolean) => {
    const next = new Set(selectedIds);
    module.permissions.forEach((permission) => {
      if (selected) {
        next.add(permission.id);
      } else {
        next.delete(permission.id);
      }
    });
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {t("permissionsTitle")}{" "}
          <span className="text-muted-foreground">
            ( {selectedIds.size}/{allIds.length} )
          </span>
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            placeholder={t("searchPermissionsPlaceholder")}
            onValueChange={setSearch}
            className="sm:w-64"
            disabled={disabled || loading}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline-invert"
              onClick={() => onChange(new Set())}
              disabled={disabled || loading}
            >
              {t("rejectAll")}
            </Button>
            <Button
              type="button"
              onClick={() => onChange(new Set(allIds))}
              disabled={disabled || loading}
            >
              {t("selectAll")}
            </Button>
          </div>
        </div>
      </div>

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <Spinner size="lg" className="text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {t("loadingPermissions")}
          </span>
        </div>
      ) : filteredModules.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("noPermissions")}</p>
      ) : (
        <Accordion multiple keepMounted={false}>
          {filteredModules.map((module) => {
            const selectedCount = module.permissions.filter((permission) =>
              selectedIds.has(permission.id),
            ).length;
            const allSelected =
              module.permissions.length > 0 && selectedCount === module.permissions.length;

            return (
              <AccordionItem key={module.id} value={module.id}>
                <AccordionTrigger
                  action={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("rowActionsLabel")}
                            className="text-muted-foreground hover:text-foreground"
                          />
                        }
                      >
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setModule(module, false)}
                          disabled={disabled}
                        >
                          <RotateCcw />
                          {t("moduleReset")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setModule(module, true)}
                          disabled={disabled}
                        >
                          <CheckCheck />
                          {t("moduleSelectAll")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                >
                  <span>
                    {module.name}{" "}
                    <span className="text-muted-foreground">
                      ({selectedCount}/{module.permissions.length})
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionPanel className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[32rem] table-fixed text-sm">
                      <thead>
                        <tr className="border-b border-border text-start text-muted-foreground">
                          <th className="w-10 px-4 py-3 text-start">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={(checked) => setModule(module, checked === true)}
                              aria-label={t("moduleSelectAll")}
                              disabled={disabled}
                            />
                          </th>
                          <th className="px-4 py-3 text-start font-medium">{t("permColumnKey")}</th>
                          <th className="px-4 py-3 text-start font-medium">
                            {t("permColumnDescription")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {module.permissions.map((permission) => (
                          <tr key={permission.id} className="border-b border-border last:border-0">
                            <td className="w-10 px-4 py-3 text-start">
                              <Checkbox
                                checked={selectedIds.has(permission.id)}
                                onCheckedChange={() => toggle(permission.id)}
                                aria-label={permission.key}
                                disabled={disabled}
                              />
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">
                              {permission.key}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {permission.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

export { PermissionSelector };
