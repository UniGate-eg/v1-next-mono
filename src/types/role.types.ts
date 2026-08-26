export interface PermissionDTO {
  id: string;
  code: string;
  domain: string;
  action: string;
  description: string | null;
  createdAt: Date;
}

export interface RoleDTO {
  id: string;
  key: string;
  name: string;
  description: string | null;
  hierarchyLevel: number;
  isSystemDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithPermissionsDTO extends RoleDTO {
  permissions: PermissionDTO[];
  userCount?: number;
}
