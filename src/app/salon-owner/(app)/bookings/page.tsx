"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { QueryStates } from "@/components/ui/QueryStates";
import { useBookings, useCreateBooking, useServices, useStaffList } from "@/hooks/use-salon-owner";
import { bookingStatusVariant, formatColomboDateTime } from "@/lib/booking-ui";
import {
  ALL_BOOKING_SOURCES,
  ALL_BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  type BookingCreateInput,
  type BookingStatus,
} from "@/lib/shared";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const EMPTY_BOOKING: BookingCreateInput = {
  customerName: "",
  customerPhone: "",
  customerEmail: null,
  serviceId: "",
  staffId: null,
  startAt: "",
  source: "WALK_IN",
  internalNotes: null,
};

function CreateBookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: servicesData } = useServices({ isActive: true, limit: 100 });
  const { data: staffData } = useStaffList({ isActive: true, limit: 100 });
  const createBooking = useCreateBooking();
  const [form, setForm] = useState<BookingCreateInput>(EMPTY_BOOKING);
  const [localDateTime, setLocalDateTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!localDateTime) {
      setError("Choose a date and time.");
      return;
    }
    try {
      await createBooking.mutateAsync({
        ...form,
        startAt: new Date(`${localDateTime}:00+05:30`).toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the booking.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create manual booking">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Customer name"
          required
          value={form.customerName}
          onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            required
            placeholder="+94XXXXXXXXX"
            value={form.customerPhone}
            onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.customerEmail ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value || null }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium tracking-tight text-neutral-800">Service</label>
          <select
            required
            value={form.serviceId}
            onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}
            className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="">Select a service</option>
            {(servicesData?.items ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMinutes} min)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium tracking-tight text-neutral-800">
            Staff (optional — assign now or later)
          </label>
          <select
            value={form.staffId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value || null }))}
            className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="">Unassigned</option>
            {(staffData?.items ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium tracking-tight text-neutral-800">Date & time</label>
            <input
              type="datetime-local"
              required
              value={localDateTime}
              onChange={(e) => setLocalDateTime(e.target.value)}
              className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium tracking-tight text-neutral-800">Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as typeof f.source }))}
              className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            >
              {ALL_BOOKING_SOURCES.filter((s) => s !== "CUSTOMER_APP").map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Internal notes"
          value={form.internalNotes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value || null }))}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose} disabled={createBooking.isPending}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={createBooking.isPending}>
            Create booking
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "">(
    (searchParams.get("status") as BookingStatus) || "",
  );
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(() => searchParams.get("new") === "1");

  const { data, isLoading, isError } = useBookings({
    search: search || undefined,
    status: status || undefined,
    page,
    limit: 20,
  });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-neutral-500">Review, assign, and manage every appointment.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>
          Create manual booking
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="max-w-sm flex-1">
          <Input
            icon={<Search className="size-4" />}
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as BookingStatus | "");
            setPage(1);
          }}
          className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        >
          <option value="">All statuses</option>
          {ALL_BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={items.length === 0}
                emptyMessage="No bookings match these filters."
                colSpan={5}
              >
                {items.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => router.push(`/salon-owner/bookings/${b.id}`)}
                    className="cursor-pointer border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{b.customerName}</p>
                      <p className="text-xs text-neutral-400">{b.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{b.serviceName}</td>
                    <td className="px-4 py-3 text-neutral-600">{b.staffName ?? "Unassigned"}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatColomboDateTime(b.startAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </QueryStates>
            </tbody>
          </table>
        </div>
        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        )}
      </Card>

      <CreateBookingModal key={String(modalOpen)} open={modalOpen} onClose={() => setModalOpen(false)} />

      <p className="mt-6 text-xs text-neutral-400">
        <Link href="/salon-owner/calendar" className="underline hover:text-rose-600">
          Prefer a calendar view?
        </Link>
      </p>
    </div>
  );
}
