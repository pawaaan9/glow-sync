"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryStates } from "@/components/ui/QueryStates";
import { useSalonOwnerDashboard } from "@/hooks/use-salon-owner";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  History,
  Plus,
  Scissors,
  UserPlus,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

function formatLkr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone?: "neutral" | "rose" | "purple" | "amber" | "success";
}) {
  const toneStyles: Record<string, string> = {
    neutral: "bg-neutral-100 text-neutral-600",
    rose: "bg-rose-100 text-rose-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <span className={`flex size-10 items-center justify-center rounded-2xl ${toneStyles[tone]}`}>
          <Icon className="size-5" />
        </span>
        <span className="font-display text-2xl text-ink">{value}</span>
        <span className="text-sm text-neutral-500">{label}</span>
      </CardBody>
    </Card>
  );
}

export default function SalonOwnerDashboardPage() {
  const { data, isLoading, isError } = useSalonOwnerDashboard();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          An overview of today&apos;s bookings, revenue, and what needs your attention.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/salon-owner/services?new=1" size="sm" icon={<Plus className="size-4" />}>
          Add service
        </Button>
        <Button
          href="/salon-owner/staff?new=1"
          size="sm"
          variant="secondary"
          icon={<UserPlus className="size-4" />}
        >
          Add staff
        </Button>
        <Button
          href="/salon-owner/bookings?new=1"
          size="sm"
          variant="secondary"
          icon={<CalendarPlus className="size-4" />}
        >
          Create manual booking
        </Button>
        <Button
          href="/salon-owner/bookings?status=PENDING_SALON_REVIEW"
          size="sm"
          variant="outline"
          icon={<Clock className="size-4" />}
        >
          View pending requests
        </Button>
        <Button
          href="/salon-owner/working-hours"
          size="sm"
          variant="outline"
          icon={<History className="size-4" />}
        >
          Block time
        </Button>
      </div>

      <div className="mt-6">
        <QueryStates isLoading={isLoading} isError={isError} isEmpty={false}>
          {data && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <StatCard icon={Clock} label="Today's bookings" value={data.counts.todayBookings} tone="purple" />
                <StatCard
                  icon={Clock}
                  label="Pending requests"
                  value={data.counts.pendingRequests}
                  tone="amber"
                />
                <StatCard
                  icon={Users}
                  label="Awaiting staff confirmation"
                  value={data.counts.awaitingStaffAcceptance}
                  tone="amber"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Confirmed bookings"
                  value={data.counts.confirmed}
                  tone="success"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Completed this month"
                  value={data.counts.completedThisMonth}
                  tone="success"
                />
                <StatCard
                  icon={Clock}
                  label="Cancelled this month"
                  value={data.counts.cancelledThisMonth}
                  tone="rose"
                />
                <StatCard icon={Users} label="Active staff" value={data.counts.activeStaff} tone="purple" />
                <StatCard
                  icon={Scissors}
                  label="Active services"
                  value={data.counts.activeServices}
                  tone="purple"
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardBody>
                    <p className="text-sm text-neutral-500">Today&apos;s estimated revenue</p>
                    <p className="font-display mt-1 text-3xl text-ink">
                      {formatLkr(data.revenue.todayLkr)}
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-sm text-neutral-500">Monthly estimated revenue</p>
                    <p className="font-display mt-1 text-3xl text-ink">
                      {formatLkr(data.revenue.monthLkr)}
                    </p>
                  </CardBody>
                </Card>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardBody>
                    <h2 className="font-display text-lg text-ink">Upcoming appointments</h2>
                    {data.upcomingAppointments.length === 0 ? (
                      <p className="mt-3 text-sm text-neutral-400">No upcoming appointments.</p>
                    ) : (
                      <ul className="mt-3 flex flex-col divide-y divide-neutral-100">
                        {data.upcomingAppointments.map((b) => (
                          <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{b.customerName}</p>
                              <p className="truncate text-xs text-neutral-500">
                                {b.serviceName} · {b.staffName ?? "Unassigned"}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs text-neutral-500">
                              {new Date(b.startAt).toLocaleString("en-LK", {
                                timeZone: "Asia/Colombo",
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h2 className="font-display text-lg text-ink">Recent activity</h2>
                    {data.recentActivity.length === 0 ? (
                      <p className="mt-3 text-sm text-neutral-400">No activity yet.</p>
                    ) : (
                      <ul className="mt-3 flex flex-col divide-y divide-neutral-100">
                        {data.recentActivity.map((a) => (
                          <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                            <Badge variant="neutral" className="capitalize">
                              {a.action.replaceAll("_", " ").toLowerCase()}
                            </Badge>
                            <span className="shrink-0 text-xs text-neutral-500">
                              {new Date(a.createdAt).toLocaleString("en-LK", {
                                timeZone: "Asia/Colombo",
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardBody>
                </Card>
              </div>
            </>
          )}
        </QueryStates>
      </div>
    </div>
  );
}
