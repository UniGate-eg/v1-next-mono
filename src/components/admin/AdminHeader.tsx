"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";

export function AdminHeader() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="font-semibold text-gray-800">UniGate Administration</h1>
      <div className="flex items-center gap-4">
        {/* Placeholder for user profile info */}
        <div className="text-sm text-gray-600">Admin User</div>
        <Button variant="outline" size="sm" onClick={() => {
          // Implement logout later using better-auth client
          window.location.href = "/";
        }}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
