import { RatingStars } from "@/components/salon/RatingStars";
import { StatusBadge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/Card";
import { getMyBookings } from "@/lib/api";
import { salons } from "@/lib/mock-data";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { CalendarClock, Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Staff portal — GlowSync",
  description: "See your upcoming appointments and client notes.",
};

export default async function StaffDashboardPage() {
  // Stand-in for the signed-in stylist until auth exists.
  const salon = salons[0];
  const me = salon.staff[0];
  const bookings = (await getMyBookings()).slice(0, 3);

  const minutes = bookings.reduce((total, b) => total + b.durationMinutes, 0);
  const earnings = bookings.reduce((total, b) => total + b.price, 0);

  return (
    <div className="relative">
      <div className="aurora grain absolute inset-x-0 top-0 h-80 opacity-60" />

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="relative size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white">
            {me.avatarUrl && (
              <Image
                src={me.avatarUrl}
                alt={me.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            )}
          </span>
          <div>
            <span className="eyebrow text-rose-600">Staff portal</span>
            <h1 className="font-display font-display-tight mt-1.5 text-[clamp(1.75rem,4vw,2.75rem)] text-ink">
              {me.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {me.role} · {salon.name}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <RatingStars rating={me.rating} size={13} />
              <span className="text-xs text-neutral-500">
                {me.reviewCount} client reviews
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: CalendarClock,
              label: "Appointments",
              value: String(bookings.length),
            },
            { icon: Clock, label: "Chair time", value: formatDuration(minutes) },
            {
              icon: Sparkles,
              label: "Expected takings",
              value: formatCurrency(earnings),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="absolute -right-6 -top-6 size-24 rounded-full bg-amber-100/60 blur-2xl transition-colors duration-500 group-hover:bg-rose-100" />
              <span className="relative flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 text-white">
                <stat.icon className="size-5" />
              </span>
              <p className="font-display relative mt-4 text-2xl text-ink">
                {stat.value}
              </p>
              <p className="relative mt-0.5 text-sm text-neutral-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-14">
          <SectionHeading eyebrow="Today and beyond" title="Your chair schedule" />
          <div className="mt-6 flex flex-col gap-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center gap-4 rounded-3xl border border-neutral-100 bg-white p-5 transition-shadow duration-300 hover:shadow-[0_20px_44px_-34px_rgba(217,36,88,0.6)]"
              >
                <span className="font-display flex w-18 shrink-0 flex-col rounded-2xl bg-linear-to-br from-rose-50 to-purple-50 px-3 py-2.5 text-center text-lg text-rose-700">
                  {booking.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{booking.serviceName}</p>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">
                    {booking.customerName} ·{" "}
                    {formatDuration(booking.durationMinutes)} ·{" "}
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionHeading eyebrow="Profile" title="Your specialties" />
          <div className="mt-5 flex flex-wrap gap-2">
            {me.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600"
              >
                {s}
              </span>
            ))}
          </div>
          {me.bio && (
            <p className="mt-5 max-w-xl leading-relaxed text-neutral-600">
              {me.bio}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
