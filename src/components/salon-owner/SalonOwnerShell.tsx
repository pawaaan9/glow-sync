"use client";

import {
  DashboardSidebar,
  type SidebarNavItem,
} from "@/components/layout/DashboardSidebar";
import { useSidebar } from "@/components/layout/use-sidebar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NotificationsBell } from "@/components/ui/NotificationsBell";
import { useSalonOwnerDashboard } from "@/hooks/use-salon-owner";
import { useAuth } from "@/providers/auth-provider";
import {
  CalendarClock,
  CalendarDays,
  Clock,
  LayoutDashboard,
  Menu,
  Scissors,
  Settings as SettingsIcon,
  Sparkles,
  Store,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type BadgeKey = "pendingRequests" | "awaitingStaffAcceptance";

interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: BadgeKey;
}

const NAV_ITEMS: NavItemConfig[] = [
  { href: "/salon-owner/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/salon-owner/bookings",
    label: "Bookings",
    icon: CalendarClock,
    badge: "pendingRequests",
  },
  { href: "/salon-owner/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/salon-owner/services", label: "Services", icon: Scissors },
  { href: "/salon-owner/staff", label: "Staff", icon: Users },
  { href: "/salon-owner/customers", label: "Customers", icon: UserRound },
  { href: "/salon-owner/working-hours", label: "Working Hours", icon: Clock },
  { href: "/salon-owner/salon-profile", label: "Salon Profile", icon: Store },
  { href: "/salon-owner/settings", label: "Settings", icon: SettingsIcon },
];

export function SalonOwnerShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { me, signOut } = useAuth();
  const sidebar = useSidebar();
  const { data } = useSalonOwnerDashboard();

  const [signOutOpen, setSignOutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const salon = me?.salon;

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
        homeHref="/salon-owner/dashboard"
        brand={{
          name: salon?.name ?? "GlowSync",
          subtitle: "Salon Owner",
          icon: Sparkles,
          logoUrl: salon?.logoUrl,
        }}
        account={{ name: me?.user.fullName ?? "Owner", email: me?.user.email ?? "" }}
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
          <span className="font-display hidden text-lg text-ink lg:block">
            {title ?? "Salon Dashboard"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <NotificationsBell basePath="/api/salon-owner" />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleSignOut}
        title="Log out?"
        description="You'll be signed out of your salon dashboard and need to sign back in to manage bookings."
        confirmLabel="Log out"
        variant="danger"
        isSubmitting={loggingOut}
      />
    </div>
  );
}
