"use client";

import { Pagination } from "@/components/ui/Pagination";
import { QueryStates } from "@/components/ui/QueryStates";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useSalonApplications } from "@/hooks/use-platform-admin";
import {
  ALL_SALON_CATEGORIES,
  ALL_SALON_STATUSES,
  SALON_CATEGORY_LABELS,
  type SalonsQuery,
} from "@/lib/shared";
import { cn } from "@/lib/utils";
import { ChevronDown, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const selectClasses =
  "h-11 rounded-2xl border border-neutral-200 bg-white px-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

export default function SalonApplicationsPage() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SalonsQuery["status"] | "">(
    (searchParams.get("status") as SalonsQuery["status"]) || "",
  );
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState<SalonsQuery["category"] | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink">Salon applications</h1>
      <p className="mt-1 text-sm text-neutral-500">Review and act on submitted applications.</p>

      <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-neutral-100 bg-white p-4 lg:flex-row lg:items-center">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by salon, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={status}
              onChange={(e) =>
                updateFilter(setStatus, e.target.value as SalonsQuery["status"] | "")
              }
              className={cn(selectClasses, "pr-9")}
            >
              <option value="">All statuses</option>
              {ALL_SALON_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          </div>

          <input
            placeholder="District"
            value={district}
            onChange={(e) => updateFilter(setDistrict, e.target.value)}
            className="h-11 w-32 rounded-2xl border border-neutral-200 bg-white px-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />

          <div className="relative">
            <select
              value={category}
              onChange={(e) =>
                updateFilter(setCategory, e.target.value as SalonsQuery["category"] | "")
              }
              className={cn(selectClasses, "pr-9")}
            >
              <option value="">All categories</option>
              {ALL_SALON_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {SALON_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          </div>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => updateFilter(setSortOrder, e.target.value as "asc" | "desc")}
              className={cn(selectClasses, "pr-9")}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Salon</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={!isLoading && (data?.items.length ?? 0) === 0}
                emptyMessage="No applications match your filters."
                colSpan={8}
              >
                {data?.items.map((salon) => (
                  <tr key={salon.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-ink">{salon.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{salon.ownerName ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      <div>{salon.ownerEmail ?? "—"}</div>
                      <div className="text-xs text-neutral-400">{salon.ownerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {SALON_CATEGORY_LABELS[salon.category]}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{salon.district}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(salon.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={salon.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/platform-admin/salon-applications/${salon.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
                      >
                        <Eye className="size-3.5" />
                        View
                      </Link>
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
    </div>
  );
}
