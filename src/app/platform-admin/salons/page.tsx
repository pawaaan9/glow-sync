"use client";

import { Pagination } from "@/components/ui/Pagination";
import { QueryStates } from "@/components/ui/QueryStates";
import { ReasonModal } from "@/components/ui/ReasonModal";
import { Input } from "@/components/ui/Input";
import { useSalons, useSuspendSalon } from "@/hooks/use-platform-admin";
import { SALON_STATUS, SALON_CATEGORY_LABELS } from "@/lib/shared";
import { Eye, Search, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ApprovedSalonsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [suspendTarget, setSuspendTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError } = useSalons({
    status: SALON_STATUS.ACTIVE,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });
  const suspend = useSuspendSalon();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink">Approved salons</h1>
      <p className="mt-1 text-sm text-neutral-500">Active salons currently live on GlowSync.</p>

      <div className="mt-6 rounded-3xl border border-neutral-100 bg-white p-4">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search salons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Salon</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Approved</th>
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
                emptyMessage="No approved salons yet."
                colSpan={6}
              >
                {data?.items.map((salon) => (
                  <tr key={salon.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-ink">{salon.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{salon.ownerName ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {SALON_CATEGORY_LABELS[salon.category]}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{salon.district}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {salon.approvedAt ? new Date(salon.approvedAt).toLocaleDateString() : "—"}
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
                          onClick={() => setSuspendTarget({ id: salon.id, name: salon.name })}
                          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-neutral-500 hover:text-red-600"
                        >
                          <ShieldOff className="size-3.5" />
                          Suspend
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

      <ReasonModal
        open={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onSubmit={(reason) =>
          suspendTarget &&
          suspend.mutate(
            { salonId: suspendTarget.id, reason },
            { onSuccess: () => setSuspendTarget(null) },
          )
        }
        title={`Suspend ${suspendTarget?.name ?? "this salon"}`}
        description="Salon-management access will be blocked immediately and the salon hidden from public search. Data and bookings are preserved."
        submitLabel="Suspend salon"
        isSubmitting={suspend.isPending}
      />
    </div>
  );
}
