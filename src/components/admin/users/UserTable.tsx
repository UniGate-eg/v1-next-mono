"use client";

import React, { useState } from "react";
import { AdminUserDTO } from "../../../types/user.types";
import { RoleDTO } from "../../../types/role.types";
import { RoleAssignmentSheet } from "./RoleAssignmentSheet";
import { UserStatusToggle } from "./UserStatusToggle";
import { Search, Building, UserCircle } from "lucide-react";
import Link from "next/link";

interface UserTableProps {
  initialUsers: AdminUserDTO[];
  roles: RoleDTO[];
  universities: Array<{ id: string; nameEn: string; nameAr: string }>;
}

export function UserTable({ initialUsers, roles, universities }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" ||
      u.roles.some((r) => r.key === roleFilter);

    const matchesStatus =
      statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by staff name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Roles</th>
                <th className="py-3.5 px-4">Institution Scope</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No users matching criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/admin/users/${u.id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                            {u.name}
                          </Link>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <UserStatusToggle userId={u.id} currentStatus={u.status} userName={u.name} />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.length === 0 ? (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600">
                            Student
                          </span>
                        ) : (
                          u.roles.map((r) => (
                            <span
                              key={r.id}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                r.key === "SUPER_ADMIN"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : r.key === "ADMIN"
                                  ? "bg-sky-100 text-sky-700"
                                  : r.key === "CONTENT_EDITOR"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : r.key === "UNIVERSITY_REP"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-violet-100 text-violet-700"
                              }`}
                            >
                              {r.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {u.assignedUniversities && u.assignedUniversities.length > 0 ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.assignedUniversities.map((un) => un.nameEn).join(", ")}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Global / N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <RoleAssignmentSheet
                        user={u}
                        availableRoles={roles}
                        availableUniversities={universities}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
