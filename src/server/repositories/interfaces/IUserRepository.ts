import { UserDTO, AdminUserDTO, UserFilters, UserStatus } from "../../../types/user.types";

export interface IUserReader {
  findById(id: string): Promise<UserDTO | null>;
  findByEmail(email: string): Promise<UserDTO | null>;
  findAdminUserById(id: string): Promise<AdminUserDTO | null>;
  findMany(filters?: UserFilters, page?: number, limit?: number): Promise<{ data: AdminUserDTO[]; total: number }>;
  countActiveSuperAdmins(): Promise<number>;
}

export interface IUserWriter {
  updateStatus(id: string, status: UserStatus): Promise<UserDTO>;
  updateRole(id: string, role: string): Promise<UserDTO>;
}

export interface IUserRepository extends IUserReader, IUserWriter {}
