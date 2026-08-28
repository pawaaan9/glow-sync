"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ReasonModal } from "@/components/ui/ReasonModal";
import { useSalonCategories, useSalons, useSuspendSalon } from "@/hooks/use-platform-admin";
import { SALON_STATUS, salonCategoryLabel, type SalonDTO } from "@/lib/shared";
import { Eye, Search, ShieldOff, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  const { data: categories } = useSalonCategories();
  const suspend = useSuspendSalon();

  const categoryLabels = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.slug, c.label])),
    [categories],
  );

  const columns: DataTableColumn<SalonDTO>[] = [
    {
      key: "salon",
      header: "Salon",
      cardSlot: "primary",
      cell: (salon) => (
        <div className="flex items-center gap-3">
          <span className="font-display flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-100 to-purple-100 text-xs text-rose-600">
            {salon.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{salon.name}</p>
            <p className="truncate text-xs text-neutral-400">{salon.city}</p>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      cell: (salon) => (
        <div className="min-w-0">
          <p className="truncate text-neutral-700">{salon.ownerName ?? "—"}</p>
          <p className="truncate text-xs text-neutral-400">{salon.ownerEmail ?? ""}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (salon) => (
        <span className="text-neutral-600">
          {salonCategoryLabel(salon.category, categoryLabels)}
        </span>
      ),
    },
    {
      key: "district",
      header: "District",
      cell: (salon) => <span className="text-neutral-600">{salon.district}</span>,
    },
    {
      key: "approved",
      header: "Approved",
      cell: (salon) => (
        <span className="whitespace-nowrap text-neutral-500">
          {salon.approvedAt ? new Date(salon.approvedAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Directory"
        title="Approved salons"
        description="Active salons currently live on GlowSync."
        icon={Store}
      />

      <div className="rounded-3xl border border-neutral-100 bg-white p-4">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by salon, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(salon) => salon.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={
          debouncedSearch ? "No salons match your search." : "No approved salons yet."
        }
        emptyIcon={Store}
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
              onClick={() => setSuspendTarget({ id: salon.id, name: salon.name })}
              className="flex cursor-pointer items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-red-600"
            >
              <ShieldOff className="size-3.5" />
              Suspend
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
