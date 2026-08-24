"use client";

import { Pagination } from "@/components/platform-admin/Pagination";
import { QueryStates } from "@/components/platform-admin/QueryStates";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useSalonOwners } from "@/hooks/use-platform-admin";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function SalonOwnersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError } = useSalonOwners({
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink">Salon owners</h1>
      <p className="mt-1 text-sm text-neutral-500">Every registered salon-owner account.</p>

      <div className="mt-6 rounded-3xl border border-neutral-100 bg-white p-4">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={!isLoading && (data?.items.length ?? 0) === 0}
                emptyMessage="No salon owners yet."
                colSpan={5}
              >
                {data?.items.map((owner) => (
                  <tr key={owner.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-ink">{owner.fullName}</td>
                    <td className="px-4 py-3 text-neutral-600">{owner.email}</td>
                    <td className="px-4 py-3 text-neutral-600">{owner.phone}</td>
                    <td className="px-4 py-3">
                      {owner.verificationStatus && (
                        <StatusBadge status={owner.verificationStatus} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(owner.createdAt).toLocaleDateString()}
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
