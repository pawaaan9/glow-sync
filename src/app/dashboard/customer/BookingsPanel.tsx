"use client";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import type { Booking } from "@/lib/types";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { CalendarX, Clock, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Tab = "upcoming" | "past";

const tabs: { value: Tab; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

function isUpcomingStatus(status: Booking["status"]) {
  return status === "confirmed" || status === "pending";
}

export function BookingsPanel({ bookings }: { bookings: Booking[] }) {
  const [tab, setTab] = useState<Tab>("upcoming");

  const visible = bookings.filter((b) =>
    tab === "upcoming" ? isUpcomingStatus(b.status) : !isUpcomingStatus(b.status),
  );

  return (
    <div>
      <div className="inline-flex gap-1 rounded-full border border-neutral-200 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "relative cursor-pointer rounded-full px-5 py-2 text-sm font-medium tracking-tight transition-colors duration-200",
              tab === t.value ? "text-white" : "text-neutral-600 hover:text-rose-700",
            )}
          >
            {tab === t.value && (
              <span className="absolute inset-0 rounded-full bg-linear-to-r from-rose-500 to-purple-500" />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-4xl border border-dashed border-neutral-200 py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-rose-100 to-purple-100 text-rose-500">
              <CalendarX className="size-7" />
            </span>
            <h3 className="font-display text-xl text-ink">
              Nothing {tab === "upcoming" ? "coming up" : "in your history"}
            </h3>
            <p className="max-w-sm text-sm text-neutral-500">
              {tab === "upcoming"
                ? "Your next glow-up is one search away."
                : "Once you complete a visit it will show up here."}
            </p>
            <Button href="/search" variant="outline" size="sm">
              Browse salons
            </Button>
          </div>
        ) : (
          visible.map((booking) => (
            <article
              key={booking.id}
              className="group flex flex-col gap-5 rounded-3xl border border-neutral-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-34px_rgba(217,36,88,0.6)] sm:flex-row sm:items-center"
            >
              {/* Date block */}
              <div className="flex size-18 shrink-0 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-rose-50 to-purple-50 text-rose-700">
                <span className="text-[0.65rem] uppercase tracking-wider">
                  {new Date(booking.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
                <span className="font-display text-2xl">
                  {new Date(booking.date).getDate()}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg text-ink">
                    {booking.serviceName}
                  </h3>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {booking.salonName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="size-3.5" />
                    {booking.staffName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {booking.time} · {formatDuration(booking.durationMinutes)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                <span className="font-display text-xl text-ink">
                  {formatCurrency(booking.price)}
                </span>
                <Link
                  href="/search"
                  className="text-sm font-medium text-rose-600 transition-colors hover:text-rose-700 hover:underline"
                >
                  {isUpcomingStatus(booking.status) ? "Manage" : "Book again"}
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
