"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  useAddSalonBlockedTime,
  useMySalon,
  useRemoveTimeOff,
  useTimeOff,
  useUpdateWorkingHours,
} from "@/hooks/use-salon-owner";
import { DAYS_OF_WEEK, DAY_LABELS, type SalonDTO, type WeeklyHours } from "@/lib/shared";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function WorkingHoursPage() {
  const { data: salon, isLoading } = useMySalon();

  if (isLoading || !salon) return <FullPageLoader />;

  // Keyed by salon.id so the weekly-hours draft is seeded fresh from the
  // loaded salon exactly once, without syncing it via an effect.
  return <WorkingHoursForm key={salon.id} salon={salon} />;
}

function WorkingHoursForm({ salon }: { salon: SalonDTO }) {
  const updateWorkingHours = useUpdateWorkingHours();
  const { data: timeOff } = useTimeOff();
  const addBlock = useAddSalonBlockedTime();
  const removeTimeOff = useRemoveTimeOff();

  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(() => salon.weeklyHours);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [saved, setSaved] = useState(false);

  function setDay(day: keyof WeeklyHours, patch: Partial<WeeklyHours[typeof day]>) {
    setWeeklyHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  const salonBlocks = (timeOff ?? []).filter((t) => t.staffId === null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Working Hours</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Used to calculate available booking slots across your salon.
      </p>

      <Card className="mt-6">
        <CardBody className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-ink">Weekly schedule</h2>
          {DAYS_OF_WEEK.map((day) => {
            const d = weeklyHours[day];
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex w-32 shrink-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={d.isOpen}
                    onChange={(e) => setDay(day, { isOpen: e.target.checked })}
                  />
                  {DAY_LABELS[day]}
                </label>
                <input
                  type="time"
                  disabled={!d.isOpen}
                  value={d.open}
                  onChange={(e) => setDay(day, { open: e.target.value })}
                  className="rounded-xl border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40"
                />
                <span className="text-neutral-400">to</span>
                <input
                  type="time"
                  disabled={!d.isOpen}
                  value={d.close}
                  onChange={(e) => setDay(day, { close: e.target.value })}
                  className="rounded-xl border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40"
                />
              </div>
            );
          })}

          {saved && <p className="text-sm text-emerald-600">Saved.</p>}

          <Button
            className="mt-2 w-fit"
            loading={updateWorkingHours.isPending}
            onClick={() =>
              updateWorkingHours.mutate(
                { weeklyHours },
                { onSuccess: () => setSaved(true) },
              )
            }
          >
            Save schedule
          </Button>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-ink">Salon blocked time</h2>
          <p className="text-sm text-neutral-500">
            Block time across the whole salon — a renovation, a holiday, or an early close.
          </p>

          <ul className="flex flex-col gap-1.5">
            {salonBlocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-2 text-sm text-neutral-600">
                <span>
                  {new Date(b.startAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })} –{" "}
                  {new Date(b.endAt).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })} · {b.reason}
                </span>
                <button
                  onClick={() => removeTimeOff.mutate(b.id)}
                  className="cursor-pointer text-neutral-400 hover:text-red-600"
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
            {salonBlocks.length === 0 && <li className="text-sm text-neutral-400">No blocked time.</li>}
          </ul>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <input
              type="datetime-local"
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-sm sm:col-span-1 col-span-2"
            />
          </div>
          <Button
            className="w-fit"
            size="sm"
            disabled={!blockStart || !blockEnd || !blockReason || addBlock.isPending}
            onClick={() =>
              addBlock.mutate(
                {
                  startAt: new Date(`${blockStart}:00+05:30`).toISOString(),
                  endAt: new Date(`${blockEnd}:00+05:30`).toISOString(),
                  reason: blockReason,
                },
                {
                  onSuccess: () => {
                    setBlockStart("");
                    setBlockEnd("");
                    setBlockReason("");
                  },
                },
              )
            }
          >
            Add blocked time
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
