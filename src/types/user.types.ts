import { RoleDTO } from "./role.types";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string; // legacy enum string for compatibility
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserDTO extends UserDTO {
  roles: RoleDTO[];
  assignedUniversityIds: string[];
  assignedUniversities?: Array<{ id: string; nameEn: string; nameAr: string; slug: string }>;
}

export interface UserFilters {
  search?: string;
  roleKey?: string;
  status?: UserStatus;
  universityId?: string;
  page?: number;
  limit?: number;
}
