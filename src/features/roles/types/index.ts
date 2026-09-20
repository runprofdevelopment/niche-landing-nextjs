export type RoleStatus = "active" | "inactive";

export type PermissionItem = {
  id: string;
  key: string;
  description: string;
};

export type PermissionModule = {
  id: string;
  name: string;
  permissions: PermissionItem[];
};

export type RolePermissionOverview = PermissionItem & {
  moduleName: string;
};

export type RoleListItem = {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
  assignedUsersCount: number;
  activeUsersCount: number;
  status: RoleStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type RoleDetails = {
  id: string;
  name: string;
  status: RoleStatus;
  description: string;
  permissionsCount: number;
  assignedUsersCount: number;
  activeUsersCount: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  isActive: boolean;
  permissions: RolePermissionOverview[];
  /** Permission keys assigned to this role (backend `permissionKeys`). */
  permissionKeys: string[];
  permissionModuleNames: string[];
};

export type RoleFormInitialData = {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  permissionKeys: string[];
};
