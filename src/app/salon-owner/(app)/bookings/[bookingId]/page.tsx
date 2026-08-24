"use client";

import { FullPageLoader } from "@/components/auth/FullPageLoader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { ReasonModal } from "@/components/ui/ReasonModal";
import {
  useAssignBookingStaff,
  useBooking,
  useCancelBooking,
  useCompleteBooking,
  useDeclineBooking,
  useMarkBookingNoShow,
  useRecordStaffDecision,
  useRescheduleBooking,
  useStaffList,
  useUpdateBookingNotes,
} from "@/hooks/use-salon-owner";
import { bookingStatusVariant, formatColomboDateTime, formatLkr } from "@/lib/booking-ui";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "@/lib/shared";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: booking, isLoading } = useBooking(bookingId);
  const { data: staffData } = useStaffList({ isActive: true, limit: 100 });

  const assignStaff = useAssignBookingStaff();
  const staffDecision = useRecordStaffDecision();
  const decline = useDeclineBooking();
  const cancel = useCancelBooking();
  const reschedule = useRescheduleBooking();
  const complete = useCompleteBooking();
  const noShow = useMarkBookingNoShow();
  const updateNotes = useUpdateBookingNotes();

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [declineOpen, setDeclineOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [notes, setNotes] = useState("");
  const [notesEditing, setNotesEditing] = useState(false);
  const [completeConfirm, setCompleteConfirm] = useState(false);
  const [noShowConfirm, setNoShowConfirm] = useState(false);

  if (isLoading || !booking) return <FullPageLoader />;

  const status = booking.status;
  const staff = staffData?.items ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/salon-owner/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-rose-600"
      >
        <ArrowLeft className="size-4" />
        Back to bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{booking.customerName}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {booking.serviceName} · {formatColomboDateTime(booking.startAt)}
          </p>
        </div>
        <Badge variant={bookingStatusVariant(status)} className="text-sm">
          {BOOKING_STATUS_LABELS[status]}
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Customer phone</p>
                <p className="font-medium text-ink">{booking.customerPhone}</p>
              </div>
              <div>
                <p className="text-neutral-400">Customer email</p>
                <p className="font-medium text-ink">{booking.customerEmail ?? "—"}</p>
              </div>
              <div>
                <p className="text-neutral-400">Staff</p>
                <p className="font-medium text-ink">{booking.staffName ?? "Unassigned"}</p>
              </div>
              <div>
                <p className="text-neutral-400">Duration</p>
                <p className="font-medium text-ink">{booking.serviceDurationMinutes} min</p>
              </div>
              <div>
                <p className="text-neutral-400">Price</p>
                <p className="font-medium text-ink">{formatLkr(booking.servicePriceLkr)}</p>
              </div>
              <div>
                <p className="text-neutral-400">Source</p>
                <p className="font-medium text-ink">{booking.source.replaceAll("_", " ")}</p>
              </div>
            </div>

            {booking.declineReason && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                Declined: {booking.declineReason}
              </p>
            )}
            {booking.cancellationReason && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                Cancelled: {booking.cancellationReason}
              </p>
            )}

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-800">Internal notes</p>
                {!notesEditing && (
                  <button
                    onClick={() => {
                      setNotes(booking.internalNotes ?? "");
                      setNotesEditing(true);
                    }}
                    className="cursor-pointer text-xs text-rose-600 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              {notesEditing ? (
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setNotesEditing(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      loading={updateNotes.isPending}
                      onClick={() =>
                        updateNotes.mutate(
                          { bookingId, input: { notes } },
                          { onSuccess: () => setNotesEditing(false) },
                        )
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-neutral-500">{booking.internalNotes || "No notes yet."}</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-2">
            <p className="text-sm font-medium text-neutral-800">Actions</p>

            {(status === BOOKING_STATUS.PENDING_SALON_REVIEW ||
              status === BOOKING_STATUS.REJECTED_BY_STAFF) && (
              <Button size="sm" fullWidth onClick={() => setAssignOpen(true)}>
                {status === BOOKING_STATUS.REJECTED_BY_STAFF ? "Reassign staff" : "Assign staff"}
              </Button>
            )}

            {status === BOOKING_STATUS.PENDING_STAFF_ACCEPTANCE && (
              <>
                <Button
                  size="sm"
                  fullWidth
                  variant="secondary"
                  loading={staffDecision.isPending}
                  onClick={() =>
                    staffDecision.mutate({ bookingId, input: { decision: "ACCEPTED" } })
                  }
                >
                  Record staff acceptance
                </Button>
                <Button size="sm" fullWidth variant="outline" onClick={() => setRejectOpen(true)}>
                  Record staff rejection
                </Button>
              </>
            )}

            {status === BOOKING_STATUS.CONFIRMED && (
              <>
                <Button size="sm" fullWidth onClick={() => setCompleteConfirm(true)}>
                  Mark completed
                </Button>
                <Button size="sm" fullWidth variant="outline" onClick={() => setNoShowConfirm(true)}>
                  Mark no-show
                </Button>
              </>
            )}

            {(status === BOOKING_STATUS.PENDING_SALON_REVIEW ||
              status === BOOKING_STATUS.PENDING_STAFF_ACCEPTANCE ||
              status === BOOKING_STATUS.CONFIRMED) && (
              <>
                <Button
                  size="sm"
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setRescheduleAt(booking.startAt.slice(0, 16));
                    setRescheduleOpen(true);
                  }}
                >
                  Reschedule
                </Button>
                <Button size="sm" fullWidth variant="outline" onClick={() => setDeclineOpen(true)}>
                  Decline
                </Button>
                <Button size="sm" fullWidth variant="danger" onClick={() => setCancelOpen(true)}>
                  Cancel booking
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardBody>
          <p className="text-sm font-medium text-neutral-800">History</p>
          <ul className="mt-3 flex flex-col gap-3">
            {booking.history.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-400" />
                <div>
                  <p className="font-medium text-ink">{BOOKING_STATUS_LABELS[h.status]}</p>
                  <p className="text-xs text-neutral-400">
                    {formatColomboDateTime(h.changedAt)}
                    {h.note ? ` · ${h.note}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign staff">
        <div className="flex flex-col gap-4">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="">Select a staff member</option>
            {staff
              .filter((s) => s.assignedServiceIds.includes(booking.serviceId))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
          </select>
          <Button
            fullWidth
            disabled={!selectedStaffId}
            loading={assignStaff.isPending}
            onClick={() =>
              assignStaff.mutate(
                { bookingId, input: { staffId: selectedStaffId } },
                { onSuccess: () => setAssignOpen(false) },
              )
            }
          >
            Assign
          </Button>
        </div>
      </Modal>

      <Modal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Reschedule booking">
        <div className="flex flex-col gap-4">
          <input
            type="datetime-local"
            value={rescheduleAt}
            onChange={(e) => setRescheduleAt(e.target.value)}
            className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
          <Button
            fullWidth
            loading={reschedule.isPending}
            onClick={() =>
              reschedule.mutate(
                { bookingId, input: { startAt: new Date(`${rescheduleAt}:00+05:30`).toISOString() } },
                { onSuccess: () => setRescheduleOpen(false) },
              )
            }
          >
            Reschedule
          </Button>
        </div>
      </Modal>

      <ReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Record staff rejection"
        description="Why is the staff member rejecting this booking? You'll be able to assign someone else next."
        submitLabel="Record rejection"
        isSubmitting={staffDecision.isPending}
        onSubmit={(reason) =>
          staffDecision.mutate(
            { bookingId, input: { decision: "REJECTED", reason } },
            { onSuccess: () => setRejectOpen(false) },
          )
        }
      />

      <ReasonModal
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        title="Decline booking"
        description="This tells the customer why their request couldn't be accepted."
        submitLabel="Decline"
        isSubmitting={decline.isPending}
        onSubmit={(reason) =>
          decline.mutate({ bookingId, reason }, { onSuccess: () => setDeclineOpen(false) })
        }
      />

      <ReasonModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel booking"
        description="This cancels a booking that was already confirmed."
        submitLabel="Cancel booking"
        isSubmitting={cancel.isPending}
        onSubmit={(reason) => cancel.mutate({ bookingId, reason }, { onSuccess: () => setCancelOpen(false) })}
      />

      <ConfirmDialog
        open={completeConfirm}
        onClose={() => setCompleteConfirm(false)}
        onConfirm={() => complete.mutate(bookingId, { onSuccess: () => setCompleteConfirm(false) })}
        title="Mark as completed?"
        description="This records the visit and updates the customer's spending history."
        confirmLabel="Mark completed"
        isSubmitting={complete.isPending}
      />

      <ConfirmDialog
        open={noShowConfirm}
        onClose={() => setNoShowConfirm(false)}
        onConfirm={() => noShow.mutate(bookingId, { onSuccess: () => setNoShowConfirm(false) })}
        title="Mark as no-show?"
        description="This records that the customer did not arrive for their appointment."
        confirmLabel="Mark no-show"
        variant="danger"
        isSubmitting={noShow.isPending}
      />
    </div>
  );
}
