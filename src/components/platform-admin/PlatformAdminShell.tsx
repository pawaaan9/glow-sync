"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NotificationsBell } from "@/components/ui/NotificationsBell";
import { SuperAdminLogin } from "@/components/platform-admin/SuperAdminLogin";
import { usePlatformAdminDashboard } from "@/hooks/use-platform-admin";
import { ROLES } from "@/lib/shared";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldOff,
  Sparkles,
  Store,
  Tags,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type ReactNode } from "react";

/**
 * `badge` names a counter from the dashboard summary; the nav renders it as
 * a pill so pending work is visible without opening the page first.
 */
interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: "pendingApplications" | "suspendedSalons";
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/platform-admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Moderation",
    items: [
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
    ],
  },
  {
    label: "Directory",
    items: [
      { href: "/platform-admin/salons", label: "Salons", icon: Store, exact: true },
      { href: "/platform-admin/salon-owners", label: "Salon owners", icon: Users },
    ],
  },
  {
    label: "Catalogue",
    items: [{ href: "/platform-admin/categories", label: "Categories", icon: Tags }],
  },
  {
    label: "Records",
    items: [{ href: "/platform-admin/audit-logs", label: "Audit log", icon: History }],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data } = usePlatformAdminDashboard();

  return (
    <nav className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          {/* Not `.eyebrow`: that class is declared unlayered in globals.css,
              so it would override any Tailwind font-size utility here. */}
          <span className="px-4 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
            {group.label}
          </span>

          {group.items.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const count = item.badge ? (data?.counts[item.badge] ?? 0) : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl py-2.5 pl-4 pr-3 text-sm font-medium tracking-tight transition-all duration-200",
                  active
                    ? "bg-linear-to-r from-rose-500/90 to-purple-500/90 text-white"
                    : "text-white/60 hover:translate-x-0.5 hover:bg-white/5 hover:text-white",
                )}
              >
                {/* Glow rail marking the current section. */}
                <span
                  className={cn(
                    "absolute -left-4 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-rose-400 to-purple-400 transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white",
                  )}
                >
                  <item.icon className="size-4.5" />
                </span>

                <span className="truncate">{item.label}</span>

                {count > 0 && (
                  <span
                    className={cn(
                      "ml-auto min-w-6 rounded-full px-2 py-0.5 text-center text-[0.7rem] font-semibold tabular-nums",
                      active ? "bg-white/25 text-white" : "bg-rose-500/20 text-rose-200",
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <Link href="/platform-admin" className="flex items-center gap-3 px-2">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 shadow-[0_10px_24px_-12px_var(--color-purple-500)]">
        <Sparkles className="size-5 text-white" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-display text-base text-white">GlowSync</span>
        <span className="eyebrow text-rose-300/80">Super Admin</span>
      </span>
    </Link>
  );
}

/** Signed-in admin card pinned to the bottom of the rail, with sign-out. */
function SidebarAccount() {
  const { me, signOut } = useAuth();
  const name = me?.user.fullName ?? "Admin";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleConfirm() {
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setLoggingOut(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
        <span className="font-display flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-purple-600 text-sm text-white">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-white">{name}</span>
          <span className="block truncate text-xs text-white/40">{me?.user.email}</span>
        </span>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Log out"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Log out?"
        description="You'll be signed out of the platform admin console and need to enter your credentials again to get back in."
        confirmLabel="Log out"
        variant="danger"
        isSubmitting={loggingOut}
      />
    </>
  );
}

/**
 * The shared inner layout of the rail — brand, nav, account card. Used by
 * both the desktop sidebar and the mobile drawer so the two can never
 * drift apart.
 */
function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto px-5 py-6">
      <SidebarBrand />
      <div className="flex-1">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <SidebarAccount />
    </div>
  );
}

/** The ink panel's rose/purple bloom, shared by the sidebar and the drawer. */
function SidebarGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-70"
      style={{
        backgroundImage:
          "radial-gradient(22rem 16rem at 15% 0%, var(--color-rose-500), transparent 70%), radial-gradient(20rem 18rem at 90% 100%, var(--color-purple-600), transparent 68%)",
      }}
    />
  );
}

export function PlatformAdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
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

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Desktop sidebar. The dark panel sets the admin console apart from
          the customer-facing site. */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-hidden bg-ink lg:block">
        <SidebarGlow />
        <div className="relative h-full">
          <SidebarBody />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-neutral-100 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
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

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-rise absolute inset-y-0 left-0 w-72 overflow-hidden bg-ink shadow-2xl">
            <SidebarGlow />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-6 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <div className="relative h-full">
              <SidebarBody onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
