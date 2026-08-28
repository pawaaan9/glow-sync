"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useReactivateSalon, useSalons } from "@/hooks/use-platform-admin";
import { SALON_STATUS, type SalonDTO } from "@/lib/shared";
import { Eye, RotateCcw, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SuspendedSalonsPage() {
  const [page, setPage] = useState(1);
  const [reactivateTarget, setReactivateTarget] = useState<{ id: string; name: string } | null>(
    null,
  );

  const { data, isLoading, isError } = useSalons({
    status: SALON_STATUS.SUSPENDED,
    page,
    limit: 20,
  });
  const reactivate = useReactivateSalon();

  const columns: DataTableColumn<SalonDTO>[] = [
    {
      key: "salon",
      header: "Salon",
      cardSlot: "primary",
      cell: (salon) => <span className="font-medium text-ink">{salon.name}</span>,
    },
    {
      key: "owner",
      header: "Owner",
      cell: (salon) => <span className="text-neutral-600">{salon.ownerName ?? "—"}</span>,
    },
    {
      key: "reason",
      header: "Suspension reason",
      className: "max-w-xs",
      cell: (salon) => (
        <span className="line-clamp-2 text-neutral-500" title={salon.suspendedReason ?? undefined}>
          {salon.suspendedReason ?? "—"}
        </span>
      ),
    },
    {
      key: "suspended",
      header: "Suspended",
      cell: (salon) => (
        <span className="whitespace-nowrap text-neutral-500">
          {new Date(salon.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Moderation"
        title="Suspended salons"
        description="Hidden from public search; salon-management APIs are blocked for these salons."
        icon={ShieldOff}
      />

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(salon) => salon.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No suspended salons — everything is in good standing."
        emptyIcon={ShieldOff}
        actions={(salon) => (
          <>
            <Link
              href={`/platform-admin/salon-applications/${salon.id}`}
              className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
            >
              <Eye className="size-3.5" />
              View
            </Link>
            <button
              type="button"
              onClick={() => setReactivateTarget({ id: salon.id, name: salon.name })}
              className="flex cursor-pointer items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-emerald-600"
            >
              <RotateCcw className="size-3.5" />
              Reactivate
            </button>
          </>
        )}
        footer={
          data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={setPage}
            />
          )
        }
      />

      <ConfirmDialog
        open={Boolean(reactivateTarget)}
        onClose={() => setReactivateTarget(null)}
        onConfirm={() =>
          reactivateTarget &&
          reactivate.mutate(reactivateTarget.id, { onSuccess: () => setReactivateTarget(null) })
        }
        title={`Reactivate ${reactivateTarget?.name ?? "this salon"}?`}
        description="The salon becomes active again and the owner regains salon-management access."
        confirmLabel="Reactivate"
        isSubmitting={reactivate.isPending}
      />
    </div>
  );
}
