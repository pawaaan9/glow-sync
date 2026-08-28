"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import {
  DashboardSidebar,
  type SidebarNavItem,
} from "@/components/layout/DashboardSidebar";
import { useSidebar } from "@/components/layout/use-sidebar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NotificationsBell } from "@/components/ui/NotificationsBell";
import { SuperAdminLogin } from "@/components/platform-admin/SuperAdminLogin";
import { usePlatformAdminDashboard } from "@/hooks/use-platform-admin";
import { ROLES } from "@/lib/shared";
import { useAuth } from "@/providers/auth-provider";
import {
  ClipboardList,
  History,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Store,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type BadgeKey = "pendingApplications" | "suspendedSalons";

interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: BadgeKey;
}

const NAV_ITEMS: NavItemConfig[] = [
  { href: "/platform-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/platform-admin/salon-applications",
    label: "Applications",
    icon: ClipboardList,
    badge: "pendingApplications",
  },
  {
    href: "/platform-admin/salons/suspended",
    label: "Suspended",
    icon: ShieldOff,
    badge: "suspendedSalons",
  },
  { href: "/platform-admin/salons", label: "Salons", icon: Store, exact: true },
  { href: "/platform-admin/salon-owners", label: "Salon owners", icon: Users },
  { href: "/platform-admin/categories", label: "Categories", icon: Tags },
  { href: "/platform-admin/verification-history", label: "Verification", icon: ShieldCheck },
  { href: "/platform-admin/audit-logs", label: "Audit log", icon: History },
];

function AdminChrome({ children }: { children: ReactNode }) {
  const { me, signOut } = useAuth();
  const sidebar = useSidebar();
  const { data } = usePlatformAdminDashboard();

  const [signOutOpen, setSignOutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = useMemo<SidebarNavItem[]>(
    () =>
      NAV_ITEMS.map((item) => ({
        href: item.href,
        label: item.label,
        icon: item.icon,
        exact: item.exact,
        badgeCount: item.badge ? (data?.counts[item.badge] ?? 0) : undefined,
      })),
    [data],
  );

  async function handleSignOut() {
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setLoggingOut(false);
      setSignOutOpen(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <DashboardSidebar
        homeHref="/platform-admin"
        brand={{ name: "GlowSync", subtitle: "Super Admin", icon: Sparkles }}
        account={{ name: me?.user.fullName ?? "Admin", email: me?.user.email ?? "" }}
        navItems={navItems}
        isExpanded={sidebar.isExpanded}
        isMobileOpen={sidebar.isMobileOpen}
        onToggleExpand={sidebar.toggleExpand}
        onCloseMobile={sidebar.closeMobile}
        onSignOutClick={() => setSignOutOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-neutral-100 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={sidebar.openMobile}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display hidden text-lg text-ink lg:block">Platform Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <NotificationsBell basePath="/api/platform-admin" />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleSignOut}
        title="Log out?"
        description="You'll be signed out of the platform admin console and need to enter your credentials again to get back in."
        confirmLabel="Log out"
        variant="danger"
        isSubmitting={loggingOut}
      />
    </div>
  );
}

export function PlatformAdminShell({ children }: { children: ReactNode }) {
  const { firebaseUser, me, isLoading, isError, refetch } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  // Unlike the other dashboards, the admin panel does not bounce visitors
  // to /login — it *is* the super admin's login surface, so the form
  // renders right here at /platform-admin.
  if (!firebaseUser || isError) {
    return <SuperAdminLogin onSignedIn={() => refetch()} />;
  }
  if (!me || me.user.role !== ROLES.PLATFORM_ADMIN) {
    return <SuperAdminLogin wrongRole onSignedIn={() => refetch()} />;
  }

  return <AdminChrome>{children}</AdminChrome>;
}
