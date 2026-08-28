"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useSalonOwners } from "@/hooks/use-platform-admin";
import { relativeTime } from "@/lib/admin-ui";
import type { UserDTO } from "@/lib/shared";
import { Search, Users } from "lucide-react";
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

  const columns: DataTableColumn<UserDTO>[] = [
    {
      key: "name",
      header: "Name",
      cardSlot: "primary",
      cell: (owner) => (
        <div className="flex items-center gap-3">
          <span className="font-display flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-purple-600 text-xs text-white">
            {owner.fullName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate font-medium text-ink">{owner.fullName}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (owner) => (
        <a
          href={`mailto:${owner.email}`}
          className="text-neutral-600 transition-colors hover:text-rose-600"
        >
          {owner.email}
        </a>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (owner) => <span className="whitespace-nowrap text-neutral-600">{owner.phone}</span>,
    },
    {
      key: "status",
      header: "Status",
      cardSlot: "badge",
      cell: (owner) =>
        owner.verificationStatus ? <StatusBadge status={owner.verificationStatus} /> : "—",
    },
    {
      key: "joined",
      header: "Joined",
      cell: (owner) => (
        <span
          className="whitespace-nowrap text-neutral-500"
          title={new Date(owner.createdAt).toLocaleString()}
        >
          {relativeTime(owner.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Directory"
        title="Salon owners"
        description="Every registered salon-owner account."
        icon={Users}
      />

      <div className="rounded-3xl border border-neutral-100 bg-white p-4">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(owner) => owner.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={
          debouncedSearch ? "No owners match your search." : "No salon owners yet."
        }
        emptyIcon={Users}
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
