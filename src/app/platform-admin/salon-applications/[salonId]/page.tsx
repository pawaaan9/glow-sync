"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QueryStates } from "@/components/ui/QueryStates";
import { ReasonModal } from "@/components/ui/ReasonModal";
import {
  useApproveSalonApplication,
  useReactivateSalon,
  useRejectSalonApplication,
  useSalonApplication,
  useSalonCategories,
  useSuspendSalon,
} from "@/hooks/use-platform-admin";
import { getActionMeta, relativeTime } from "@/lib/admin-ui";
import { getVerificationDocumentDownloadUrl } from "@/lib/api/platformAdmin";
import { salonCategoryLabel, SALON_STATUS } from "@/lib/shared";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldOff,
  Store,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-50 pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-neutral-400 sm:text-sm sm:normal-case sm:tracking-normal">
        {label}
      </dt>
      <dd className="min-w-0 wrap-break-word text-ink sm:text-right">{value || "—"}</dd>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 sm:p-6">
      <h2 className="font-display flex items-center gap-2 text-lg text-ink">
        <Icon className="size-4.5 text-rose-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SalonApplicationDetailPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useSalonApplication(salonId);
  const { data: categories } = useSalonCategories();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const approve = useApproveSalonApplication();
  const reject = useRejectSalonApplication();
  const suspend = useSuspendSalon();
  const reactivate = useReactivateSalon();

  const categoryLabels = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.slug, c.label])),
    [categories],
  );

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
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/platform-admin/salon-applications"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-rose-600"
      >
        <ArrowLeft className="size-4" />
        Back to applications
      </Link>

      <QueryStates isLoading={isLoading} isError={isError} isEmpty={false}>
        {data && (
          <>
            {/* Hero: identity + the decisions available in this state. */}
            <div className="relative overflow-hidden rounded-3xl bg-ink p-5 text-white sm:p-6">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(20rem 14rem at 8% 0%, var(--color-rose-500), transparent 70%), radial-gradient(18rem 16rem at 95% 100%, var(--color-purple-600), transparent 68%)",
                }}
              />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  {data.salon.logoUrl ? (
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:size-16">
                      <Image
                        src={data.salon.logoUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <span className="font-display flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl backdrop-blur sm:size-16">
                      {data.salon.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h1 className="font-display truncate text-xl sm:text-2xl">
                      {data.salon.name}
                    </h1>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/60">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {data.salon.city}, {data.salon.district}
                      </span>
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={data.salon.status} />
                      <span className="text-xs text-white/50">
                        Submitted {relativeTime(data.salon.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {data.salon.status === SALON_STATUS.PENDING_APPROVAL && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setRejectOpen(true)}
                        icon={<XCircle className="size-4" />}
                        className="flex-1 border-white/20 bg-white/10 text-white backdrop-blur hover:border-white/40 hover:bg-white/20 lg:flex-none"
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => setApproveOpen(true)}
                        icon={<CheckCircle2 className="size-4" />}
                        className="flex-1 lg:flex-none"
                      >
                        Approve
                      </Button>
                    </>
                  )}

                  {data.salon.status === SALON_STATUS.ACTIVE && (
                    <Button
                      variant="danger"
                      onClick={() => setSuspendOpen(true)}
                      icon={<ShieldOff className="size-4" />}
                      fullWidth
                      className="lg:w-auto"
                    >
                      Suspend salon
                    </Button>
                  )}

                  {data.salon.status === SALON_STATUS.SUSPENDED && (
                    <Button
                      onClick={() => setReactivateOpen(true)}
                      icon={<RotateCcw className="size-4" />}
                      fullWidth
                      className="lg:w-auto"
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Reasons surface right under the hero — they drive the next decision. */}
            {(data.salon.rejectionReason || data.salon.suspendedReason) && (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-900">
                <p className="font-medium">
                  {data.salon.suspendedReason ? "Suspension reason" : "Rejection reason"}
                </p>
                <p className="mt-1 leading-relaxed">
                  {data.salon.suspendedReason ?? data.salon.rejectionReason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card title="Owner" icon={User}>
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
                  <span className="font-display flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-purple-600 text-white">
                    {(data.owner?.fullName ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{data.owner?.fullName ?? "—"}</p>
                    {data.owner?.verificationStatus && (
                      <StatusBadge status={data.owner.verificationStatus} className="mt-1" />
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {data.owner?.email && (
                    <a
                      href={`mailto:${data.owner.email}`}
                      className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-neutral-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Mail className="size-4 shrink-0 text-neutral-400" />
                      <span className="truncate">{data.owner.email}</span>
                    </a>
                  )}
                  {data.owner?.phone && (
                    <a
                      href={`tel:${data.owner.phone}`}
                      className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-neutral-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Phone className="size-4 shrink-0 text-neutral-400" />
                      {data.owner.phone}
                    </a>
                  )}
                </div>
              </Card>

              <Card title="Salon details" icon={Store}>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <Row
                    label="Category"
                    value={salonCategoryLabel(data.salon.category, categoryLabels)}
                  />
                  <Row label="Business phone" value={data.salon.businessPhone} />
                  <Row label="Business email" value={data.salon.businessEmail} />
                  <Row label="Address" value={data.salon.address} />
                  <Row
                    label="Registration no."
                    value={data.salon.businessRegistrationNumber ?? "Not provided"}
                  />
                  <Row label="Staff" value={String(data.salon.numberOfStaff)} />
                </dl>
              </Card>
            </div>

            <Card title="About this salon" icon={Store}>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {data.salon.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-neutral-50 pt-4">
                {data.salon.hasVerificationDocument ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={viewDocument}
                    icon={<FileText className="size-4" />}
                  >
                    View verification document
                  </Button>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-neutral-400">
                    <FileText className="size-4" />
                    No verification document uploaded
                  </p>
                )}
                {docError && <p className="text-xs text-red-600">{docError}</p>}
              </div>
            </Card>

            <Card title="Verification history" icon={CheckCircle2}>
              {data.history.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-400">No history yet.</p>
              ) : (
                <ol className="mt-4 flex flex-col">
                  {data.history.map((entry, i) => {
                    const meta = getActionMeta(entry.action);
                    const isLast = i === data.history.length - 1;
                    return (
                      <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {!isLast && (
                          <span
                            aria-hidden
                            className="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-neutral-100"
                          />
                        )}
                        <span
                          className={cn(
                            "relative flex size-8 shrink-0 items-center justify-center rounded-full",
                            meta.tone,
                          )}
                        >
                          <meta.icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1 pt-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <p className="text-sm font-medium text-ink">{meta.label}</p>
                            <p
                              className="text-xs text-neutral-400"
                              title={new Date(entry.createdAt).toLocaleString()}
                            >
                              {relativeTime(entry.createdAt)}
                            </p>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {entry.previousStatus && (
                              <>
                                <StatusBadge status={entry.previousStatus} />
                                <ArrowRight className="size-3 shrink-0 text-neutral-300" />
                              </>
                            )}
                            <StatusBadge status={entry.newStatus} />
                          </div>
                          {entry.reason && (
                            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                              {entry.reason}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Card>
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
          reject.mutate({ salonId, reason }, { onSuccess: () => setRejectOpen(false) })
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
          suspend.mutate({ salonId, reason }, { onSuccess: () => setSuspendOpen(false) })
        }
        title="Suspend this salon"
        description="Salon-management access will be blocked immediately and the salon hidden from public search. Data and bookings are preserved."
        submitLabel="Suspend salon"
        isSubmitting={suspend.isPending}
      />

      <ConfirmDialog
        open={reactivateOpen}
        onClose={() => setReactivateOpen(false)}
        onConfirm={() => reactivate.mutate(salonId, { onSuccess: () => setReactivateOpen(false) })}
        title="Reactivate this salon?"
        description={`${data?.salon.name ?? "This salon"} will become active again and the owner will regain salon-management access.`}
        confirmLabel="Reactivate"
        isSubmitting={reactivate.isPending}
      />
    </div>
  );
}
