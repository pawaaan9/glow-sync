"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { useCustomer, useCustomerBookingHistory, useUpdateCustomerNotes } from "@/hooks/use-salon-owner";
import { bookingStatusVariant, formatColomboDateTime, formatLkr } from "@/lib/booking-ui";
import { BOOKING_STATUS_LABELS } from "@/lib/shared";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: bookings } = useCustomerBookingHistory(customerId);
  const updateNotes = useUpdateCustomerNotes();
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState(false);

  if (isLoading || !customer) return <FullPageLoader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/salon-owner/customers"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-rose-600"
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>

      <h1 className="font-display mt-4 text-2xl text-ink sm:text-3xl">{customer.fullName}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {customer.phone} {customer.email ? `· ${customer.email}` : ""}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Appointments", customer.totalAppointments],
          ["Total spend", formatLkr(customer.totalSpendLkr)],
          ["Cancellations", customer.cancellationCount],
          ["No-shows", customer.noShowCount],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardBody>
              <p className="font-display text-xl text-ink">{value}</p>
              <p className="text-xs text-neutral-500">{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardBody>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-800">Salon notes (internal)</p>
            {!editing && (
              <button
                onClick={() => {
                  setNotes(customer.notes ?? "");
                  setEditing(true);
                }}
                className="cursor-pointer text-xs text-rose-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          {editing ? (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={updateNotes.isPending}
                  onClick={() =>
                    updateNotes.mutate(
                      { customerId, input: { notes } },
                      { onSuccess: () => setEditing(false) },
                    )
                  }
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-neutral-500">{customer.notes || "No notes yet."}</p>
          )}
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody>
          <p className="text-sm font-medium text-neutral-800">Booking history</p>
          {!bookings || bookings.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-400">No bookings yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-neutral-100">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{b.serviceName}</p>
                    <p className="truncate text-xs text-neutral-400">
                      {formatColomboDateTime(b.startAt)} · {b.staffName ?? "Unassigned"}
                    </p>
                  </div>
                  <Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
