"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { usePlatformAdminDashboard } from "@/hooks/use-platform-admin";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ShieldOff,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";

const statCards = [
  {
    key: "pendingApplications" as const,
    label: "Pending applications",
    icon: Clock3,
    tone: "from-amber-500 to-amber-600",
    href: "/platform-admin/salon-applications?status=PENDING_APPROVAL",
  },
  {
    key: "approvedSalons" as const,
    label: "Approved salons",
    icon: CheckCircle2,
    tone: "from-emerald-500 to-emerald-600",
    href: "/platform-admin/salons",
  },
  {
    key: "rejectedApplications" as const,
    label: "Rejected applications",
    icon: XCircle,
    tone: "from-red-500 to-red-600",
    href: "/platform-admin/salon-applications?status=REJECTED",
  },
  {
    key: "suspendedSalons" as const,
    label: "Suspended salons",
    icon: ShieldOff,
    tone: "from-neutral-500 to-neutral-600",
    href: "/platform-admin/salons/suspended",
  },
  {
    key: "totalSalonOwners" as const,
    label: "Total salon owners",
    icon: Users,
    tone: "from-purple-500 to-purple-600",
    href: "/platform-admin/salon-owners",
  },
  {
    key: "applicationsThisMonth" as const,
    label: "Applications this month",
    icon: CalendarClock,
    tone: "from-rose-500 to-rose-600",
    href: "/platform-admin/salon-applications",
  },
];

export default function PlatformAdminDashboardPage() {
  const { data, isLoading, isError } = usePlatformAdminDashboard();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        An overview of salon applications and platform activity.
      </p>

      {isError && (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load the dashboard. Please refresh the page.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-5 transition-transform duration-300 hover:-translate-y-1"
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-2xl bg-linear-to-br text-white",
                card.tone,
              )}
            >
              <card.icon className="size-4.5" />
            </span>
            <p className="mt-4 font-display text-3xl text-ink">
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

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg text-ink">Recently submitted applications</h2>
          <div className="mt-4 flex flex-col gap-2">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
              ))}
            {!isLoading && data?.recentApplications.length === 0 && (
              <p className="text-sm text-neutral-400">No applications yet.</p>
            )}
            {data?.recentApplications.map((salon) => (
              <Link
                key={salon.id}
                href={`/platform-admin/salon-applications/${salon.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-white p-4 transition-shadow hover:shadow-[0_16px_36px_-28px_rgba(217,36,88,0.5)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{salon.name}</p>
                  <p className="truncate text-xs text-neutral-400">
                    {salon.city}, {salon.district} ·{" "}
                    {new Date(salon.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={salon.status} />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink">Recent administrative activity</h2>
          <div className="mt-4 flex flex-col gap-2">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-neutral-100" />
              ))}
            {!isLoading && data?.recentActivity.length === 0 && (
              <p className="text-sm text-neutral-400">No activity yet.</p>
            )}
            {data?.recentActivity.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-neutral-100 bg-white p-4 text-sm"
              >
                <p className="font-medium text-ink">{log.action.replaceAll("_", " ")}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
