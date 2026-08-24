"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QueryStates } from "@/components/ui/QueryStates";
import { ReasonModal } from "@/components/ui/ReasonModal";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  useApproveSalonApplication,
  useReactivateSalon,
  useRejectSalonApplication,
  useSalonApplication,
  useSuspendSalon,
} from "@/hooks/use-platform-admin";
import { getVerificationDocumentDownloadUrl } from "@/lib/api/platformAdmin";
import { SALON_CATEGORY_LABELS, SALON_STATUS } from "@/lib/shared";
import { CheckCircle2, FileText, RotateCcw, ShieldOff, XCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SalonApplicationDetailPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useSalonApplication(salonId);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const approve = useApproveSalonApplication();
  const reject = useRejectSalonApplication();
  const suspend = useSuspendSalon();
  const reactivate = useReactivateSalon();

  async function viewDocument() {
    setDocError(null);
    try {
      const { url } = await getVerificationDocumentDownloadUrl(salonId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setDocError("Couldn't open the document. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <QueryStates isLoading={isLoading} isError={isError} isEmpty={false}>
        {data && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  {data.salon.logoUrl && (
                    <span className="relative size-12 overflow-hidden rounded-2xl bg-neutral-100">
                      <Image
                        src={data.salon.logoUrl}
                        alt={data.salon.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <div>
                    <h1 className="font-display text-2xl text-ink">{data.salon.name}</h1>
                    <StatusBadge status={data.salon.status} />
                  </div>
                </div>
              </div>

              {data.salon.status === SALON_STATUS.PENDING_APPROVAL && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setRejectOpen(true)}
                    icon={<XCircle className="size-4" />}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => setApproveOpen(true)}
                    icon={<CheckCircle2 className="size-4" />}
                  >
                    Approve
                  </Button>
                </div>
              )}

              {data.salon.status === SALON_STATUS.ACTIVE && (
                <Button
                  variant="danger"
                  onClick={() => setSuspendOpen(true)}
                  icon={<ShieldOff className="size-4" />}
                >
                  Suspend salon
                </Button>
              )}

              {data.salon.status === SALON_STATUS.SUSPENDED && (
                <Button onClick={() => setReactivateOpen(true)} icon={<RotateCcw className="size-4" />}>
                  Reactivate
                </Button>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section className="rounded-3xl border border-neutral-100 bg-white p-6">
                <h2 className="font-display text-lg text-ink">Owner details</h2>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <Row label="Full name" value={data.owner?.fullName} />
                  <Row label="Email" value={data.owner?.email} />
                  <Row label="Phone" value={data.owner?.phone} />
                </dl>
              </section>

              <section className="rounded-3xl border border-neutral-100 bg-white p-6">
                <h2 className="font-display text-lg text-ink">Salon details</h2>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <Row label="Category" value={SALON_CATEGORY_LABELS[data.salon.category]} />
                  <Row label="Business phone" value={data.salon.businessPhone} />
                  <Row label="Business email" value={data.salon.businessEmail} />
                  <Row label="Address" value={data.salon.address} />
                  <Row label="City / District" value={`${data.salon.city}, ${data.salon.district}`} />
                  <Row
                    label="Business registration number"
                    value={data.salon.businessRegistrationNumber ?? "Not provided"}
                  />
                  <Row label="Number of staff" value={String(data.salon.numberOfStaff)} />
                  <Row
                    label="Submitted"
                    value={new Date(data.salon.createdAt).toLocaleString()}
                  />
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-neutral-500">
                  {data.salon.description}
                </p>
              </section>
            </div>

            {(data.salon.hasVerificationDocument ||
              data.salon.rejectionReason ||
              data.salon.suspendedReason) && (
              <section className="mt-8 rounded-3xl border border-neutral-100 bg-white p-6">
                <h2 className="font-display text-lg text-ink">Verification</h2>
                {data.salon.hasVerificationDocument && (
                  <div className="mt-3 flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={viewDocument}
                      icon={<FileText className="size-4" />}
                    >
                      View verification document
                    </Button>
                    {docError && <p className="text-xs text-red-600">{docError}</p>}
                  </div>
                )}
                {data.salon.rejectionReason && (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                    <p className="font-medium">Rejection reason</p>
                    <p className="mt-1">{data.salon.rejectionReason}</p>
                  </div>
                )}
                {data.salon.suspendedReason && (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                    <p className="font-medium">Suspension reason</p>
                    <p className="mt-1">{data.salon.suspendedReason}</p>
                  </div>
                )}
              </section>
            )}

            <section className="mt-8 rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="font-display text-lg text-ink">Verification history</h2>
              <div className="mt-4 flex flex-col gap-3">
                {data.history.length === 0 && (
                  <p className="text-sm text-neutral-400">No history yet.</p>
                )}
                {data.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-ink">{entry.action.replaceAll("_", " ")}</span>
                    <span className="text-neutral-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </QueryStates>

      <ConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={() =>
          approve.mutate(salonId, {
            onSuccess: () => {
              setApproveOpen(false);
              router.refresh();
            },
          })
        }
        title="Approve this application?"
        description={`Approving will activate ${data?.salon.name ?? "this salon"} and grant the owner access to the salon dashboard.`}
        confirmLabel="Approve"
        isSubmitting={approve.isPending}
      />

      <ReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={(reason) =>
          reject.mutate(
            { salonId, reason },
            {
              onSuccess: () => setRejectOpen(false),
            },
          )
        }
        title="Reject this application"
        description="The owner will see this reason and may resubmit after addressing it."
        submitLabel="Reject application"
        isSubmitting={reject.isPending}
      />

      <ReasonModal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        onSubmit={(reason) =>
          suspend.mutate(
            { salonId, reason },
            { onSuccess: () => setSuspendOpen(false) },
          )
        }
        title="Suspend this salon"
        description="Salon-management access will be blocked immediately and the salon hidden from public search. Data and bookings are preserved."
        submitLabel="Suspend salon"
        isSubmitting={suspend.isPending}
      />

      <ConfirmDialog
        open={reactivateOpen}
        onClose={() => setReactivateOpen(false)}
        onConfirm={() =>
          reactivate.mutate(salonId, { onSuccess: () => setReactivateOpen(false) })
        }
        title="Reactivate this salon?"
        description={`${data?.salon.name ?? "This salon"} will become active again and the owner will regain salon-management access.`}
        confirmLabel="Reactivate"
        isSubmitting={reactivate.isPending}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="text-right text-ink">{value || "—"}</dd>
    </div>
  );
}
