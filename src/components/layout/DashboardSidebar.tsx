"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ComponentType } from "react";

type IconComponent = ComponentType<{ className?: string }>;

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: IconComponent;
  /** When true, only an exact path match is "active" (not sub-routes). */
  exact?: boolean;
  /** Resolved by the caller from its dashboard summary. */
  badgeCount?: number;
}

export interface DashboardSidebarProps {
  homeHref: string;
  brand: {
    name: string;
    subtitle: string;
    icon: IconComponent;
    /** Shown instead of the icon mark when present (e.g. a salon logo). */
    logoUrl?: string | null;
  };
  account: { name: string; email: string };
  navItems: SidebarNavItem[];
  isExpanded: boolean;
  isMobileOpen: boolean;
  onToggleExpand: () => void;
  onCloseMobile: () => void;
  onSignOutClick: () => void;
}

function isItemActive(pathname: string, item: Pick<SidebarNavItem, "href" | "exact">) {
  if (pathname === item.href) return true;
  return !item.exact && pathname.startsWith(`${item.href}/`);
}

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

/** Collapsed (icon-only) rendering of one nav link. */
function CollapsedNavLink({
  item,
  active,
  onNavigate,
}: Readonly<{ item: SidebarNavItem; active: boolean; onNavigate: () => void }>) {
  const Icon = item.icon;
  const count = item.badgeCount ?? 0;

  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
        active
          ? "bg-linear-to-br from-rose-500 to-purple-600 text-white shadow-[0_8px_20px_-10px_var(--color-purple-500)]"
          : "text-white/55 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="size-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 font-body text-[9px] font-bold text-white ring-2 ring-ink">
          {count > 9 ? "9+" : count}
        </span>
      )}
      <span className="sr-only">
        {item.label}
        {count > 0 ? `, ${count} pending` : ""}
      </span>
    </Link>
  );
}

/** Expanded rendering of one nav link — icon chip, label, and badge. */
function ExpandedNavLink({
  item,
  active,
  onNavigate,
}: Readonly<{ item: SidebarNavItem; active: boolean; onNavigate: () => void }>) {
  const Icon = item.icon;
  const count = item.badgeCount ?? 0;

  return (
    <Link
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
        <Icon className="size-4.5" />
      </span>

      <span className="truncate">{item.label}</span>

      {count > 0 && (
        <span
          className={cn(
            "ml-auto min-w-6 rounded-full px-2 py-0.5 text-center text-[0.7rem] font-semibold tabular-nums",
            active ? "bg-white/25 text-white" : "bg-rose-500/20 text-rose-200",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

/** Brand mark (or salon logo) + the mobile close button. */
function SidebarBrand({
  homeHref,
  brand,
  showLabels,
  onCloseMobile,
}: Readonly<
  Pick<DashboardSidebarProps, "homeHref" | "brand" | "onCloseMobile"> & { showLabels: boolean }
>) {
  const BrandIcon = brand.icon;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center px-3",
        showLabels ? "justify-between gap-2" : "justify-center",
      )}
    >
      <Link
        href={homeHref}
        onClick={onCloseMobile}
        className={cn("flex min-w-0 items-center gap-3", showLabels ? "" : "justify-center")}
      >
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Storage URL, not an optimizable local asset
          <img
            src={brand.logoUrl}
            alt=""
            className="size-10 shrink-0 rounded-2xl object-cover shadow-[0_10px_24px_-12px_var(--color-purple-500)]"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 shadow-[0_10px_24px_-12px_var(--color-purple-500)]">
            <BrandIcon className="size-5 text-white" />
          </span>
        )}
        {showLabels && (
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-display truncate text-base text-white">{brand.name}</span>
            <span className="eyebrow text-rose-300/80">{brand.subtitle}</span>
          </span>
        )}
      </Link>

      {showLabels && (
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close menu"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}

/** The bottom rail: expand/collapse toggle (desktop) + sign-out + account card. */
function SidebarFooter({
  account,
  showLabels,
  isExpanded,
  onToggleExpand,
  onSignOutClick,
}: Readonly<
  Pick<DashboardSidebarProps, "account" | "isExpanded" | "onToggleExpand" | "onSignOutClick"> & {
    showLabels: boolean;
  }
>) {
  return (
    <>
      <div className={cn("shrink-0 px-3", showLabels ? "" : "flex justify-center")}>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={isExpanded ? "Collapse menu" : "Expand menu"}
          className={cn(
            "hidden cursor-pointer items-center gap-2 rounded-xl text-white/45 transition-colors hover:bg-white/10 hover:text-white lg:flex",
            showLabels ? "h-10 w-full justify-start px-3" : "size-10 justify-center",
          )}
        >
          {isExpanded ? (
            <ChevronLeft className="size-5 shrink-0" />
          ) : (
            <ChevronRight className="size-5 shrink-0" />
          )}
          {showLabels && <span className="font-body text-[13px] font-medium">Collapse</span>}
        </button>
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col gap-1 border-t border-white/10 px-3 pt-3",
          showLabels ? "" : "items-center",
        )}
      >
        <button
          type="button"
          onClick={onSignOutClick}
          title="Sign out"
          className={cn(
            "flex cursor-pointer items-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white",
            showLabels ? "h-10 w-full gap-2.5 px-3" : "size-11 justify-center",
          )}
        >
          <LogOut className="size-4.5 shrink-0" />
          {showLabels ? (
            <span className="text-sm font-medium">Sign out</span>
          ) : (
            <span className="sr-only">Sign out</span>
          )}
        </button>

        <div
          className={cn(
            "flex items-center gap-3",
            showLabels ? "rounded-2xl bg-white/5 px-3 py-2.5" : "py-1",
          )}
        >
          <span className="font-display flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-purple-600 text-sm text-white">
            {(account.name.charAt(0) || "?").toUpperCase()}
          </span>
          {showLabels && (
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium text-white">{account.name}</span>
              <span className="block truncate text-xs text-white/40">{account.email}</span>
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export function DashboardSidebar(props: Readonly<DashboardSidebarProps>) {
  const { navItems, isMobileOpen, isExpanded, onCloseMobile } = props;
  const pathname = usePathname();
  const showLabels = isExpanded || isMobileOpen;
  const NavLink = showLabels ? ExpandedNavLink : CollapsedNavLink;

  // Any navigation closes the mobile drawer, even if it wasn't a nav-link tap.
  useEffect(() => {
    onCloseMobile();
  }, [pathname, onCloseMobile]);

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col overflow-hidden bg-ink text-white transition-[width,transform] duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          showLabels ? "w-64" : "w-19",
        )}
      >
        <SidebarGlow />

        <div className="relative flex h-full flex-col gap-4 py-5">
          <SidebarBrand
            homeHref={props.homeHref}
            brand={props.brand}
            showLabels={showLabels}
            onCloseMobile={onCloseMobile}
          />

          <nav
            className={cn(
              "flex flex-1 flex-col gap-1 overflow-y-auto",
              showLabels ? "px-3" : "items-center px-2",
            )}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isItemActive(pathname, item)}
                onNavigate={onCloseMobile}
              />
            ))}
          </nav>

          <SidebarFooter
            account={props.account}
            showLabels={showLabels}
            isExpanded={isExpanded}
            onToggleExpand={props.onToggleExpand}
            onSignOutClick={props.onSignOutClick}
          />
        </div>
      </aside>
    </>
  );
}
