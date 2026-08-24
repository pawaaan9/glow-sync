import { BookingsPanel } from "@/app/dashboard/customer/BookingsPanel";
import { Button } from "@/components/ui/Button";
import { getMyBookings, isUpcoming } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { CalendarHeart, Search, Sparkles, Wallet } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My bookings — GlowSync",
  description: "Manage your upcoming and past GlowSync appointments.",
};

export default async function CustomerDashboardPage() {
  const bookings = await getMyBookings();

  const upcoming = bookings.filter(isUpcoming);
  const completed = bookings.filter((b) => b.status === "completed");
  const spent = completed.reduce((total, b) => total + b.price, 0);

  const stats = [
    {
      icon: CalendarHeart,
      label: "Upcoming",
      value: String(upcoming.length),
      hint: upcoming.length === 1 ? "appointment" : "appointments",
    },
    {
      icon: Sparkles,
      label: "Completed",
      value: String(completed.length),
      hint: "treatments so far",
    },
    {
      icon: Wallet,
      label: "Total spent",
      value: formatCurrency(spent),
      hint: "across all visits",
    },
  ];

  return (
    <div className="relative">
      <div className="aurora grain absolute inset-x-0 top-0 h-80 opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow flex items-center gap-2 text-rose-600">
              <span className="h-px w-6 bg-rose-300" />
              Your account
            </span>
            <h1 className="font-display font-display-tight mt-3 text-[clamp(2rem,5vw,3.25rem)] text-ink">
              Hey Ava, welcome back
            </h1>
            <p className="mt-2 text-neutral-500">
              Everything you have booked, in one place.
            </p>
          </div>

          <Button href="/search" size="lg" icon={<Search className="size-4" />}>
            Book something new
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="absolute -right-6 -top-6 size-24 rounded-full bg-rose-100/60 blur-2xl transition-colors duration-500 group-hover:bg-purple-100" />
              <span className="relative flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 text-white">
                <stat.icon className="size-5" />
              </span>
              <p className="font-display relative mt-4 text-3xl text-ink">
                {stat.value}
              </p>
              <p className="relative mt-0.5 text-sm text-neutral-500">
                {stat.label} · {stat.hint}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <BookingsPanel bookings={bookings} />
        </div>
      </div>
    </div>
  );
}
