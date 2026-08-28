"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useSalonApplications, useSalonCategories } from "@/hooks/use-platform-admin";
import { relativeTime } from "@/lib/admin-ui";
import { ALL_SALON_STATUSES, salonCategoryLabel, type SalonDTO, type SalonsQuery } from "@/lib/shared";
import { cn } from "@/lib/utils";
import { ChevronDown, ClipboardList, Eye, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const selectClasses =
  "h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white pl-3 pr-9 text-sm text-ink outline-none transition-colors hover:border-neutral-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 [&::-ms-expand]:hidden";

/** A <select> plus the single chevron that replaces the native arrow. */
function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClasses}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
    </label>
  );
}

export default function SalonApplicationsPage() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SalonsQuery["status"] | "">(
    (searchParams.get("status") as SalonsQuery["status"]) || "",
  );
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Debounce free-text search so we don't refetch on every keystroke; reset
  // to page 1 in the same update rather than via a separate effect.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setDistrict("");
    setCategory("");
    setSortOrder("desc");
    setPage(1);
  }

  const hasFilters = Boolean(search || status || district || category || sortOrder !== "desc");

  const query: Partial<SalonsQuery> = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    district: district || undefined,
    category: category || undefined,
    sortOrder,
    page,
    limit: 20,
  };

  const { data, isLoading, isError } = useSalonApplications(query);
  const { data: categories } = useSalonCategories();

  const categoryLabels = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.slug, c.label])),
    [categories],
  );

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
      cell: (salon) => (
        <div className="min-w-0">
          <p className="truncate text-neutral-700">{salon.ownerName ?? "—"}</p>
          <p className="truncate text-xs text-neutral-400">{salon.ownerEmail ?? ""}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cardSlot: "hidden",
      cell: (salon) => <span className="text-neutral-500">{salon.ownerPhone ?? "—"}</span>,
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
      key: "submitted",
      header: "Submitted",
      cell: (salon) => (
        <span className="whitespace-nowrap text-neutral-500" title={new Date(salon.createdAt).toLocaleString()}>
          {relativeTime(salon.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cardSlot: "badge",
      cell: (salon) => <StatusBadge status={salon.status} />,
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Moderation"
        title="Salon applications"
        description="Review and act on submitted applications."
        icon={ClipboardList}
      />

      {/* Filters. Search is always visible; the rest collapse on mobile. */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-4">
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              icon={<Search className="size-4" />}
              placeholder="Search by salon, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={cn(
              "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border transition-colors lg:hidden",
              filtersOpen || hasFilters
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-300",
            )}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        <div
          className={cn(
            "mt-3 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4",
            filtersOpen ? "grid" : "hidden lg:grid",
          )}
        >
          <Select
            label="Status"
            value={status ?? ""}
            onChange={(v) => updateFilter(setStatus, v as SalonsQuery["status"] | "")}
          >
            <option value="">All statuses</option>
            {ALL_SALON_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </Select>

          <input
            placeholder="District"
            value={district}
            onChange={(e) => updateFilter(setDistrict, e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm text-ink outline-none transition-colors hover:border-neutral-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />

          <Select
            label="Category"
            value={category}
            onChange={(v) => updateFilter(setCategory, v)}
          >
            <option value="">All categories</option>
            {(categories ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>

          <Select
            label="Sort order"
            value={sortOrder}
            onChange={(v) => updateFilter(setSortOrder, v as "asc" | "desc")}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </Select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-rose-600"
          >
            <RotateCcw className="size-3" />
            Reset filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(salon) => salon.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No applications match your filters."
        emptyIcon={ClipboardList}
        actions={(salon) => (
          <Link
            href={`/platform-admin/salon-applications/${salon.id}`}
            className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
          >
            <Eye className="size-3.5" />
            View
          </Link>
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
    </div>
  );
}
