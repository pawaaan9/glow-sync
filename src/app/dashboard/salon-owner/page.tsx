import { RatingStars } from "@/components/salon/RatingStars";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/Card";
import { getMyBookings } from "@/lib/api";
import { salons } from "@/lib/mock-data";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { CalendarDays, Plus, Star, TrendingUp, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Salon dashboard — GlowSync",
  description: "Manage your salon bookings, staff, and services on GlowSync.",
};

export default async function SalonOwnerDashboardPage() {
  // Stand-in for the signed-in owner until auth exists.
  const salon = salons[0];
  const bookings = (await getMyBookings()).slice(0, 4);

  const revenue = salon.services.reduce((total, s) => total + s.price, 0) * 6;

  const stats = [
    {
      icon: CalendarDays,
      label: "Bookings this week",
      value: "42",
      delta: "+12%",
    },
    { icon: TrendingUp, label: "Revenue", value: formatCurrency(revenue), delta: "+8%" },
    { icon: Users, label: "Active staff", value: String(salon.staff.length), delta: "" },
    { icon: Star, label: "Rating", value: salon.rating.toFixed(1), delta: "" },
  ];

  return (
    <div className="relative">
      <div className="aurora grain absolute inset-x-0 top-0 h-80 opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="relative size-16 overflow-hidden rounded-3xl ring-3 ring-white">
              <Image
                src={salon.coverImageUrl}
                alt={salon.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
            <div>
              <span className="eyebrow text-rose-600">Salon dashboard</span>
              <h1 className="font-display font-display-tight mt-1.5 text-[clamp(1.75rem,4vw,2.75rem)] text-ink">
                {salon.name}
              </h1>
              <div className="mt-1.5 flex items-center gap-2">
                <RatingStars rating={salon.rating} size={13} />
                <span className="text-xs text-neutral-500">
                  {salon.reviewCount.toLocaleString()} reviews
                </span>
              </div>
            </div>
          </div>

          <Button size="lg" icon={<Plus className="size-4" />}>
            Add a service
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="absolute -right-6 -top-6 size-24 rounded-full bg-purple-100/60 blur-2xl transition-colors duration-500 group-hover:bg-rose-100" />
              <span className="relative flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 text-white">
                <stat.icon className="size-4.5" />
              </span>
              <p className="font-display relative mt-4 text-2xl text-ink">
                {stat.value}
                {stat.delta && (
                  <span className="ml-2 align-middle text-xs font-medium text-emerald-600">
                    {stat.delta}
                  </span>
                )}
              </p>
              <p className="relative mt-0.5 text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_20rem]">
          <section className="min-w-0">
            <SectionHeading eyebrow="Schedule" title="Next appointments" />
            <div className="mt-6 flex flex-col gap-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center gap-4 rounded-3xl border border-neutral-100 bg-white p-5 transition-shadow duration-300 hover:shadow-[0_20px_44px_-34px_rgba(217,36,88,0.6)]"
                >
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-rose-50 to-purple-50 text-rose-700">
                    <span className="font-display text-lg">
                      {new Date(booking.date).getDate()}
                    </span>
                    <span className="text-[0.6rem] uppercase tracking-wider">
                      {new Date(booking.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{booking.serviceName}</p>
                    <p className="mt-0.5 truncate text-sm text-neutral-500">
                      {booking.customerName} · {booking.staffName} · {booking.time}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                  <span className="font-display text-lg text-ink">
                    {formatCurrency(booking.price)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-8">
            <div>
              <h3 className="font-display text-lg text-ink">Your team</h3>
              <div className="mt-4 flex flex-col gap-3">
                {salon.staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                      {member.avatarUrl && (
                        <Image
                          src={member.avatarUrl}
                          alt={member.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {member.role}
                      </p>
                    </div>
                    <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-neutral-500">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {member.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg text-ink">Top services</h3>
              <div className="mt-4 flex flex-col gap-3">
                {salon.services.slice(0, 4).map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-neutral-100 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-ink">
                        {service.name}
                      </p>
                      <span className="shrink-0 text-sm text-rose-600">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {formatDuration(service.durationMinutes)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
