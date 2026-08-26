"use client";

import React, { useState } from "react";
import { AdminUserDTO } from "../../../types/user.types";
import { RoleDTO } from "../../../types/role.types";
import { RoleAssignmentSheet } from "./RoleAssignmentSheet";
import { UserStatusToggle } from "./UserStatusToggle";
import { Search, Building, UserCircle, ChevronDown } from "lucide-react";
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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#101320] p-5 rounded-3xl border border-[#1C2236] shadow-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-[#151929] border border-[#222A40] rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-bold bg-[#151929] border border-[#222A40] text-slate-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
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
            className="text-xs font-bold bg-[#151929] border border-[#222A40] text-slate-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Spacious Dark Table */}
      <div className="bg-[#101320] rounded-3xl border border-[#1C2236] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-dark-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0C0E18] border-b border-[#1A2033] text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">User Account</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Assigned Roles</th>
                <th className="py-4 px-6">Institution Scope</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B2B] text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                    No users matching criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#14192A] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-purple-500/20">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <UserStatusToggle
                        userId={u.id}
                        currentStatus={u.status}
                        userName={u.name}
                      />
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.length === 0 ? (
                          <span className="text-slate-500 italic text-[11px]">No roles assigned</span>
                        ) : (
                          u.roles.map((r) => (
                            <span
                              key={r.id}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                r.key === "SUPER_ADMIN"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                  : r.key === "ADMIN"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                  : "bg-[#181D30] text-slate-300 border border-[#262E48]"
                              }`}
                            >
                              {r.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {u.assignedUniversityIds.length === 0 ? (
                        <span className="text-slate-500 text-[11px]">Global Scope</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          <Building className="w-3 h-3" /> {u.assignedUniversityIds.length} Scoped
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
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
