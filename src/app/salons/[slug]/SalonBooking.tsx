"use client";

import { ServiceCard } from "@/components/salon/ServiceCard";
import { StaffCard } from "@/components/salon/StaffCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { Salon, Service, StaffMember } from "@/lib/types";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { CalendarCheck, PartyPopper } from "lucide-react";
import { useMemo, useState } from "react";

const timeSlots = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
];

/** The next seven days, starting today, as booking options. */
function useUpcomingDays() {
  return useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  }, []);
}

export function SalonBooking({ salon }: { salon: Salon }) {
  const days = useUpcomingDays();

  const [service, setService] = useState<Service | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [day, setDay] = useState<Date>(days[0]);
  const [time, setTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const ready = Boolean(service && staff && time);

  return (
    <>
      <section id="services">
        <SectionHeading
          eyebrow="Menu"
          title="Services"
          description="Pick a treatment to start building your appointment."
        />
        <div className="mt-6 flex flex-col gap-3">
          {salon.services.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              selected={service?.id === s.id}
              onSelect={setService}
            />
          ))}
        </div>
      </section>

      <section id="team">
        <SectionHeading
          eyebrow="The team"
          title="Choose your artist"
          description="Every professional here is vetted and rated by real clients."
        />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {salon.staff.map((member) => (
            <StaffCard
              key={member.id}
              staff={member}
              selected={staff?.id === member.id}
              onSelect={setStaff}
            />
          ))}
        </div>
      </section>

      <section id="book">
        <SectionHeading
          eyebrow="Availability"
          title="Pick a date and time"
        />

        <div className="mt-6 rounded-4xl border border-neutral-100 bg-white p-6 shadow-[0_20px_50px_-36px_rgba(217,36,88,0.6)]">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const active = d.toDateString() === day.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setDay(d)}
                  className={cn(
                    "flex min-w-16 shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-2xl border px-3 py-3 transition-all duration-200",
                    active
                      ? "border-transparent bg-linear-to-b from-rose-500 to-purple-500 text-white shadow-[0_8px_22px_-10px_var(--color-rose-500)]"
                      : "border-neutral-200 text-neutral-600 hover:-translate-y-0.5 hover:border-rose-300",
                  )}
                >
                  <span className="text-[0.65rem] uppercase tracking-wider opacity-75">
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="font-display text-xl">{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-5 sm:grid-cols-4 lg:grid-cols-7">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setTime(slot)}
                className={cn(
                  "cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all duration-200",
                  time === slot
                    ? "border-transparent bg-ink text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-rose-300 hover:text-rose-700",
                )}
              >
                {slot}
              </button>
            ))}
          </div>

          {/* Summary bar */}
          <div className="mt-6 flex flex-col gap-4 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 text-sm">
              {service ? (
                <>
                  <p className="font-display text-lg text-ink">{service.name}</p>
                  <p className="mt-0.5 text-neutral-500">
                    {staff ? staff.name : "Any professional"} ·{" "}
                    {formatDuration(service.durationMinutes)} ·{" "}
                    {day.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {time ? ` at ${time}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-neutral-500">
                  Select a service, an artist, and a time to continue.
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {service && (
                <span className="font-display text-2xl text-ink">
                  {formatCurrency(service.price)}
                </span>
              )}
              <Button
                size="lg"
                disabled={!ready}
                onClick={() => setConfirmed(true)}
                icon={<CalendarCheck className="size-4" />}
              >
                Confirm booking
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={confirmed}
        onClose={() => setConfirmed(false)}
        title="You are all booked"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-rose-100 to-purple-100 text-rose-600">
            <PartyPopper className="size-7" />
          </span>
          <p className="text-neutral-600">
            {service?.name} with {staff?.name} at {salon.name} on{" "}
            <strong className="text-ink">
              {day.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>{" "}
            at <strong className="text-ink">{time}</strong>.
          </p>
          <p className="text-sm text-neutral-400">
            A confirmation email is on its way. You can manage this appointment
            from your bookings page.
          </p>
          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
            <Button
              href="/dashboard/customer"
              fullWidth
              onClick={() => setConfirmed(false)}
            >
              View my bookings
            </Button>
            <Button variant="outline" fullWidth onClick={() => setConfirmed(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
