"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryStates } from "@/components/ui/QueryStates";
import { useBookings, useStaffList } from "@/hooks/use-salon-owner";
import { bookingStatusVariant, formatColomboTime } from "@/lib/booking-ui";
import { ALL_BOOKING_STATUSES, BOOKING_STATUS_LABELS, type BookingDTO, type BookingStatus } from "@/lib/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type View = "day" | "week" | "list";

const COLOMBO_TZ = "Asia/Colombo";

function colomboDateKey(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-CA", { timeZone: COLOMBO_TZ }); // YYYY-MM-DD
}

/** Midnight Colombo-local for the given date, expressed as a real UTC Date. */
function colomboStartOfDay(date: Date): Date {
  const key = colomboDateKey(date);
  return new Date(`${key}T00:00:00+05:30`);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}

function mondayOf(date: Date): Date {
  const key = colomboDateKey(date);
  const local = new Date(`${key}T00:00:00+05:30`);
  // Plain calendar-date weekday math (Y-M-D as UTC midnight), independent of `local`'s real UTC offset.
  const jsDay = new Date(`${key}T00:00:00Z`).getUTCDay(); // 0=Sun
  const diff = jsDay === 0 ? -6 : 1 - jsDay;
  return addDays(local, diff);
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-LK", { timeZone: COLOMBO_TZ, weekday: "short", day: "2-digit", month: "short" });
}

function BookingChip({ booking }: { booking: BookingDTO }) {
  return (
    <Link
      href={`/salon-owner/bookings/${booking.id}`}
      className="block rounded-xl border border-neutral-100 bg-white px-3 py-2 text-xs shadow-sm transition-colors hover:border-rose-200"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-ink">{formatColomboTime(booking.startAt)}</span>
        <Badge variant={bookingStatusVariant(booking.status)} className="px-1.5 py-0 text-[0.6rem]">
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
      </div>
      <p className="mt-0.5 truncate text-neutral-700">{booking.customerName}</p>
      <p className="truncate text-neutral-400">
        {booking.serviceName} · {booking.staffName ?? "Unassigned"}
      </p>
    </Link>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [staffId, setStaffId] = useState("");
  const [status, setStatus] = useState<BookingStatus | "">("");

  const { data: staffData } = useStaffList({ isActive: true, limit: 100 });

  const range = useMemo(() => {
    if (view === "day") {
      const start = colomboStartOfDay(anchor);
      return { from: start, to: addDays(start, 1) };
    }
    if (view === "week") {
      const start = mondayOf(anchor);
      return { from: start, to: addDays(start, 7) };
    }
    const start = colomboStartOfDay(anchor);
    return { from: start, to: addDays(start, 30) };
  }, [view, anchor]);

  const { data, isLoading, isError } = useBookings({
    dateFrom: range.from.toISOString(),
    dateTo: range.to.toISOString(),
    staffId: staffId || undefined,
    status: status || undefined,
    limit: 200,
  });

  const items = data?.items ?? [];

  function shift(delta: number) {
    if (view === "day") setAnchor((d) => addDays(d, delta));
    else if (view === "week") setAnchor((d) => addDays(d, delta * 7));
    else setAnchor((d) => addDays(d, delta * 30));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Calendar</h1>
          <p className="mt-1 text-sm text-neutral-500">All times shown in Asia/Colombo.</p>
        </div>
        <div className="flex gap-1 rounded-full border border-neutral-200 bg-white p-1">
          {(["day", "week", "list"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                view === v ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shift(-1)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-100"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </button>
          <Button size="sm" variant="outline" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <button
            onClick={() => shift(1)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-100"
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </button>
          <span className="ml-2 text-sm font-medium text-ink">
            {view === "day"
              ? formatDayLabel(range.from)
              : `${formatDayLabel(range.from)} – ${formatDayLabel(addDays(range.to, -1))}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="h-10 rounded-full border border-neutral-200 bg-white px-3 text-xs text-ink outline-none focus:border-rose-400"
          >
            <option value="">All staff</option>
            {(staffData?.items ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus | "")}
            className="h-10 rounded-full border border-neutral-200 bg-white px-3 text-xs text-ink outline-none focus:border-rose-400"
          >
            <option value="">All statuses</option>
            {ALL_BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <QueryStates isLoading={isLoading} isError={isError} isEmpty={items.length === 0} emptyMessage="No bookings in this range.">
          {view === "week" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {Array.from({ length: 7 }, (_, i) => addDays(range.from, i)).map((day) => {
                const key = colomboDateKey(day);
                const dayItems = items.filter((b) => colomboDateKey(b.startAt) === key);
                return (
                  <Card key={key}>
                    <CardBody className="flex flex-col gap-2 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {formatDayLabel(day)}
                      </p>
                      {dayItems.length === 0 ? (
                        <p className="text-xs text-neutral-300">No bookings</p>
                      ) : (
                        dayItems
                          .sort((a, b) => a.startAt.localeCompare(b.startAt))
                          .map((b) => <BookingChip key={b.id} booking={b} />)
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : view === "day" ? (
            <div className="flex flex-col gap-2">
              {items
                .sort((a, b) => a.startAt.localeCompare(b.startAt))
                .map((b) => (
                  <BookingChip key={b.id} booking={b} />
                ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(
                items
                  .sort((a, b) => a.startAt.localeCompare(b.startAt))
                  .reduce<Record<string, BookingDTO[]>>((acc, b) => {
                    const key = colomboDateKey(b.startAt);
                    (acc[key] ??= []).push(b);
                    return acc;
                  }, {}),
              ).map(([date, dayItems]) => (
                <div key={date}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-LK", {
                      timeZone: COLOMBO_TZ,
                      weekday: "long",
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  <div className="flex flex-col gap-2">
                    {dayItems.map((b) => (
                      <BookingChip key={b.id} booking={b} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </QueryStates>
      </div>
    </div>
  );
}
