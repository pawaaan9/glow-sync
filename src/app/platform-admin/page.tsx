"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatformAdminDashboard } from "@/hooks/use-platform-admin";
import { getActionMeta, relativeTime } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ShieldOff,
  Sparkles,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type CountKey =
  | "pendingApplications"
  | "approvedSalons"
  | "rejectedApplications"
  | "suspendedSalons"
  | "totalSalonOwners"
  | "applicationsThisMonth";

const statCards: {
  key: CountKey;
  label: string;
  icon: LucideIcon;
  tone: string;
  ring: string;
  href: string;
}[] = [
  {
    key: "pendingApplications",
    label: "Pending applications",
    icon: Clock3,
    tone: "from-amber-500 to-orange-500",
    ring: "group-hover:shadow-[0_24px_50px_-30px_var(--color-amber-500)]",
    href: "/platform-admin/salon-applications?status=PENDING_APPROVAL",
  },
  {
    key: "approvedSalons",
    label: "Approved salons",
    icon: CheckCircle2,
    tone: "from-emerald-500 to-teal-500",
    ring: "group-hover:shadow-[0_24px_50px_-30px_var(--color-emerald-500)]",
    href: "/platform-admin/salons",
  },
  {
    key: "rejectedApplications",
    label: "Rejected applications",
    icon: XCircle,
    tone: "from-red-500 to-rose-600",
    ring: "group-hover:shadow-[0_24px_50px_-30px_var(--color-red-500)]",
    href: "/platform-admin/salon-applications?status=REJECTED",
  },
  {
    key: "suspendedSalons",
    label: "Suspended salons",
    icon: ShieldOff,
    tone: "from-neutral-500 to-neutral-700",
    ring: "group-hover:shadow-[0_24px_50px_-30px_var(--color-neutral-500)]",
    href: "/platform-admin/salons/suspended",
  },
  {
    key: "totalSalonOwners",
    label: "Total salon owners",
    icon: Users,
    tone: "from-purple-500 to-indigo-500",
    ring: "group-hover:shadow-[0_24px_50px_-30px_var(--color-purple-500)]",
    href: "/platform-admin/salon-owners",
  },
  {
    key: "applicationsThisMonth",
    label: "Applications this month",
    icon: CalendarClock,
    tone: "from-rose-500 to-purple-600",
    ring: "group-hover:shadow-[0_24px_50px_-30px_var(--color-rose-500)]",
    href: "/platform-admin/salon-applications",
  },
];

export default function PlatformAdminDashboardPage() {
  const { data, isLoading, isError } = usePlatformAdminDashboard();

  const pending = data?.counts.pendingApplications ?? 0;
  const approved = data?.counts.approvedSalons ?? 0;
  const rejected = data?.counts.rejectedApplications ?? 0;
  const reviewed = approved + rejected;
  const approvalRate = reviewed > 0 ? Math.round((approved / reviewed) * 100) : null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Salon applications and platform activity at a glance."
        icon={LayoutDashboard}
      />

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load the dashboard. Please refresh the page.
        </p>
      )}

      {/* Queue callout — only when there is actually work waiting. */}
      {!isLoading && pending > 0 && (
        <Link
          href="/platform-admin/salon-applications?status=PENDING_APPROVAL"
          className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-ink p-5 text-white transition-transform duration-300 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(20rem 14rem at 10% 0%, var(--color-rose-500), transparent 70%), radial-gradient(18rem 16rem at 95% 100%, var(--color-purple-600), transparent 68%)",
            }}
          />
          <span className="relative flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="size-5.5" />
            </span>
            <span className="min-w-0">
              <span className="font-display block text-lg leading-tight">
                {pending} application{pending === 1 ? "" : "s"} waiting for review
              </span>
              <span className="mt-0.5 block text-sm text-white/60">
                Salon owners are blocked from their dashboard until you decide.
              </span>
            </span>
          </span>
          <span className="relative inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-300 group-hover:translate-x-0.5 sm:self-auto">
            Review queue
            <ArrowRight className="size-4" />
          </span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className={cn(
              "group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-transparent",
              card.ring,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl bg-linear-to-br text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
                  card.tone,
                )}
              >
                <card.icon className="size-4.5" />
              </span>
              <ArrowRight className="size-4 shrink-0 text-neutral-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-rose-500" />
            </div>

            <p className="font-display mt-4 text-3xl text-ink">
              {isLoading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-neutral-100" />
              ) : (
                (data?.counts[card.key] ?? 0)
              )}
            </p>
            <p className="mt-0.5 text-sm text-neutral-500">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Approval-rate bar — derived from the counts we already have. */}
      {approvalRate !== null && (
        <section className="rounded-3xl border border-neutral-100 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg text-ink">Approval rate</h2>
            <p className="text-sm text-neutral-500">
              <span className="font-display text-2xl text-ink">{approvalRate}%</span>{" "}
              of {reviewed} reviewed
            </p>
          </div>
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-neutral-100">
            <span
              className="bg-linear-to-r from-emerald-500 to-teal-500 transition-[width] duration-700 ease-out"
              style={{ width: `${approvalRate}%` }}
            />
            <span className="flex-1 bg-linear-to-r from-red-400 to-rose-500" />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              {approved} approved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              {rejected} rejected
            </span>
          </div>
        </section>
      )}

      {/* Recent panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-ink">Recently submitted</h2>
            <Link
              href="/platform-admin/salon-applications"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-17 animate-pulse rounded-2xl bg-neutral-100" />
              ))}

            {!isLoading && data?.recentApplications.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-400">
                No applications yet.
              </p>
            )}

            {data?.recentApplications.map((salon) => (
              <Link
                key={salon.id}
                href={`/platform-admin/salon-applications/${salon.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-[0_16px_36px_-28px_rgba(217,36,88,0.5)]"
              >
                <span className="font-display flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-rose-100 to-purple-100 text-sm text-rose-600">
                  {salon.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{salon.name}</span>
                  <span className="block truncate text-xs text-neutral-400">
                    {salon.city}, {salon.district} · {relativeTime(salon.createdAt)}
                  </span>
                </span>
                <StatusBadge status={salon.status} />
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-ink">Recent activity</h2>
            <Link
              href="/platform-admin/audit-logs"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
            >
              Audit log
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex flex-col">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="mb-2 h-14 animate-pulse rounded-2xl bg-neutral-100" />
              ))}

            {!isLoading && data?.recentActivity.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-400">
                No activity yet.
              </p>
            )}

            {/* Timeline: a rail joins the entries so order reads at a glance. */}
            {data && data.recentActivity.length > 0 && (
              <ol className="relative flex flex-col gap-1 rounded-3xl border border-neutral-100 bg-white p-4">
                {data.recentActivity.map((log, i) => {
                  const meta = getActionMeta(log.action);
                  const isLast = i === data.recentActivity.length - 1;
                  return (
                    <li key={log.id} className="relative flex gap-3 pb-3 last:pb-0">
                      {!isLast && (
                        <span
                          aria-hidden
                          className="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-neutral-100"
                        />
                      )}
                      <span
                        className={cn(
                          "relative flex size-8 shrink-0 items-center justify-center rounded-full",
                          meta.tone,
                        )}
                      >
                        <meta.icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1 pt-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {meta.label}
                        </span>
                        <span className="block text-xs text-neutral-400">
                          {relativeTime(log.createdAt)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
