"use client";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { QueryStates } from "@/components/ui/QueryStates";
import { useCustomers } from "@/hooks/use-salon-owner";
import { formatLkr } from "@/lib/booking-ui";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCustomers({ search: search || undefined, page, limit: 20 });
  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Customers</h1>
      <p className="mt-1 text-sm text-neutral-500">Everyone who has booked with your salon.</p>

      <div className="mt-6 max-w-sm">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Last visit</th>
                <th className="px-4 py-3">Next booking</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">Spend</th>
                <th className="px-4 py-3">Cancellations</th>
                <th className="px-4 py-3">No-shows</th>
              </tr>
            </thead>
            <tbody>
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={items.length === 0}
                emptyMessage="No customers yet."
                colSpan={7}
              >
                {items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/salon-owner/customers/${c.id}`)}
                    className="cursor-pointer border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{c.fullName}</p>
                      <p className="text-xs text-neutral-400">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString("en-LK") : "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.nextBookingAt ? new Date(c.nextBookingAt).toLocaleDateString("en-LK") : "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{c.totalAppointments}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatLkr(c.totalSpendLkr)}</td>
                    <td className="px-4 py-3 text-neutral-600">{c.cancellationCount}</td>
                    <td className="px-4 py-3 text-neutral-600">{c.noShowCount}</td>
                  </tr>
                ))}
              </QueryStates>
            </tbody>
          </table>
        </div>
        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
