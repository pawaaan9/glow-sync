"use client";

import { Pagination } from "@/components/platform-admin/Pagination";
import { QueryStates } from "@/components/platform-admin/QueryStates";
import { ConfirmDialog } from "@/components/platform-admin/ConfirmDialog";
import { useReactivateSalon, useSalons } from "@/hooks/use-platform-admin";
import { SALON_STATUS } from "@/lib/shared";
import { Eye, RotateCcw } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink">Suspended salons</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Hidden from public search; salon-management APIs are blocked for these salons.
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Salon</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Suspension reason</th>
                <th className="px-4 py-3 font-medium">Suspended date</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={!isLoading && (data?.items.length ?? 0) === 0}
                emptyMessage="No suspended salons."
                colSpan={5}
              >
                {data?.items.map((salon) => (
                  <tr key={salon.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-ink">{salon.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{salon.ownerName ?? "—"}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-neutral-500">
                      {salon.suspendedReason ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(salon.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/platform-admin/salon-applications/${salon.id}`}
                          className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
                        >
                          <Eye className="size-3.5" />
                          View
                        </Link>
                        <button
                          onClick={() => setReactivateTarget({ id: salon.id, name: salon.name })}
                          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-neutral-500 hover:text-emerald-600"
                        >
                          <RotateCcw className="size-3.5" />
                          Reactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </QueryStates>
            </tbody>
          </table>
        </div>

        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>

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
