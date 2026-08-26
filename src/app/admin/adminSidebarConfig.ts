import { SidebarData } from "@/components/ui/dashboard-with-collapsible-sidebar";

export function getAdminSidebarData(user?: { name?: string; role?: string }): SidebarData {
  return {
    user: {
      name: user?.name || "Mostafa Yaser",
      plan: user?.role || "Super Admin",
    },
    navItems: [
      {
        icon: "home",
        title: "Dashboard",
        href: "/admin",
      },
      {
        icon: "building2",
        title: "Universities",
        href: "/admin/universities",
      },
      {
        icon: "users",
        title: "User Management",
        href: "/admin/users",
      },
      {
        icon: "settings",
        title: "Dynamic Roles",
        href: "/admin/roles",
      },
      {
        icon: "inbox",
        title: "Suggestions",
        href: "/admin/suggestions",
      },
      {
        icon: "bell",
        title: "Notifications",
        href: "/admin/notifications",
      },
      {
        icon: "shieldcheck",
        title: "Security Audit",
        href: "/admin/audit-log",
      },
    ],
    accountNavItems: [
      {
        icon: "settings",
        title: "RBAC Settings",
        href: "/admin/roles",
      },
      {
        icon: "shieldcheck",
        title: "Security Trail",
        href: "/admin/audit-log",
      },
    ],
  };
}
