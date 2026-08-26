"use client";

import React, { useState, useMemo } from "react";
import { AdminUserDTO } from "../../../types/user.types";
import { RoleDTO } from "../../../types/role.types";
import { RoleAssignmentSheet } from "./RoleAssignmentSheet";
import { UserStatusToggle } from "./UserStatusToggle";
import {
  Search,
  Building,
  Shield,
  ShieldCheck,
  Filter,
  X,
  Users,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ChevronDown,
} from "lucide-react";

interface UserTableProps {
  initialUsers: AdminUserDTO[];
  roles: RoleDTO[];
  universities: Array<{ id: string; nameEn: string; nameAr: string }>;
}

export function UserTable({ initialUsers, roles, universities }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [scopeFilter, setScopeFilter] = useState("ALL");

  const counts = useMemo(() => {
    return {
      all: initialUsers.length,
      active: initialUsers.filter((u) => u.status === "ACTIVE").length,
      suspended: initialUsers.filter((u) => u.status === "SUSPENDED").length,
      staff: initialUsers.filter((u) => u.roles.length > 0).length,
    };
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "STAFF"
          ? u.roles.length > 0
          : u.roles.some((r) => r.key === roleFilter));

      const matchesStatus =
        statusFilter === "ALL" || u.status === statusFilter;

      const matchesScope =
        scopeFilter === "ALL" ||
        (scopeFilter === "SCOPED"
          ? u.assignedUniversityIds.length > 0
          : u.assignedUniversityIds.length === 0);

      return matchesSearch && matchesRole && matchesStatus && matchesScope;
    });
  }, [initialUsers, search, roleFilter, statusFilter, scopeFilter]);

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setScopeFilter("ALL");
  };

  const hasActiveFilters =
    search !== "" || roleFilter !== "ALL" || statusFilter !== "ALL" || scopeFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* ── Search & Filter Controls ──────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        {/* Top Row: Search + Filter Selects */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Selects */}
          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shrink-0"
            >
              <option value="ALL">All Roles</option>
              <option value="STAFF">All Elevated Staff</option>
              {roles.map((r) => (
                <option key={r.id} value={r.key}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Scope Filter */}
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shrink-0"
            >
              <option value="ALL">All Scopes</option>
              <option value="GLOBAL">Global Access</option>
              <option value="SCOPED">Institution Scoped</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                title="Reset all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Quick Status Segmented Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === "ALL"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Accounts ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Active ({counts.active})
          </button>
          <button
            onClick={() => setStatusFilter("SUSPENDED")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === "SUSPENDED"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Suspended ({counts.suspended})
          </button>
        </div>
      </div>

      {/* ── Results Count Bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> of {initialUsers.length} total users
        </span>
        {hasActiveFilters && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            Filtered view active
          </span>
        )}
      </div>

      {/* ── User Directory Table (Desktop) & Cards (Mobile) ───────── */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm overflow-hidden">
        {/* Desktop View Table (hidden on mobile < 768px) */}
        <div className="hidden md:block overflow-x-auto custom-dark-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">User Account</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Assigned Roles</th>
                <th className="py-4 px-6">Authority Scope</th>
                <th className="py-4 px-6 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting search query or active filter tags.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* User Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-500/20 shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-6">
                      <UserStatusToggle
                        userId={u.id}
                        currentStatus={u.status}
                        userName={u.name}
                      />
                    </td>

                    {/* Assigned Roles */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">
                            Student (Default)
                          </span>
                        ) : (
                          u.roles.map((r) => {
                            const isSuper = r.key === "SUPER_ADMIN";
                            const isAdmin = r.key === "ADMIN";
                            const isRep = r.key === "UNIVERSITY_REP";

                            return (
                              <span
                                key={r.id}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isSuper
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                    : isAdmin
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                    : isRep
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {r.name}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>

                    {/* Authority Scope */}
                    <td className="py-4 px-6">
                      {u.assignedUniversityIds.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span>Global Scope</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          <Building className="w-3 h-3" />
                          <span>{u.assignedUniversityIds.length} Institutional Scopes</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
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

        {/* Mobile View Cards (visible on mobile < 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No users found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting search query or active filter tags.</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-500/20 shrink-0">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</p>
                    </div>
                  </div>
                  <UserStatusToggle
                    userId={u.id}
                    currentStatus={u.status}
                    userName={u.name}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {u.roles.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px]">Student Baseline</span>
                  ) : (
                    u.roles.map((r) => (
                      <span
                        key={r.id}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                      >
                        {r.name}
                      </span>
                    ))
                  )}

                  {u.assignedUniversityIds.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                      <Building className="w-2.5 h-2.5" />
                      <span>{u.assignedUniversityIds.length} Scopes</span>
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <RoleAssignmentSheet
                    user={u}
                    availableRoles={roles}
                    availableUniversities={universities}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
