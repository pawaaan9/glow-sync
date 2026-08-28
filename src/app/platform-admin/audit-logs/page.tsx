"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useAuditLogs } from "@/hooks/use-platform-admin";
import { getActionMeta, relativeTime } from "@/lib/admin-ui";
import { AUDIT_ACTIONS, type AuditLogDTO } from "@/lib/shared";
import { cn } from "@/lib/utils";
import { ChevronDown, History } from "lucide-react";
import { useState } from "react";

const PLATFORM_ACTIONS = [
  AUDIT_ACTIONS.SALON_OWNER_REGISTERED,
  AUDIT_ACTIONS.APPLICATION_APPROVED,
  AUDIT_ACTIONS.APPLICATION_REJECTED,
  AUDIT_ACTIONS.APPLICATION_RESUBMITTED,
  AUDIT_ACTIONS.SALON_SUSPENDED,
  AUDIT_ACTIONS.SALON_REACTIVATED,
  AUDIT_ACTIONS.CATEGORY_CREATED,
  AUDIT_ACTIONS.CATEGORY_UPDATED,
  AUDIT_ACTIONS.CATEGORY_DELETED,
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");

  const { data, isLoading, isError } = useAuditLogs({
    page,
    limit: 25,
    action: action || undefined,
  });

  const columns: DataTableColumn<AuditLogDTO>[] = [
    {
      key: "action",
      header: "Action",
      cardSlot: "primary",
      cell: (log) => {
        const meta = getActionMeta(log.action);
        return (
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                meta.tone,
              )}
            >
              <meta.icon className="size-4" />
            </span>
            <span className="font-medium text-ink">{meta.label}</span>
          </div>
        );
      },
    },
    {
      key: "actor",
      header: "Actor",
      cell: (log) => (
        <span className="capitalize text-neutral-600">
          {log.actorRole.replaceAll("_", " ").toLowerCase()}
        </span>
      ),
    },
    {
      key: "target",
      header: "Target salon",
      cell: (log) =>
        log.targetSalonId ? (
          <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-600">
            {log.targetSalonId.slice(0, 10)}
          </code>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "when",
      header: "When",
      cell: (log) => (
        <span
          className="whitespace-nowrap text-neutral-500"
          title={new Date(log.createdAt).toLocaleString()}
        >
          {relativeTime(log.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Records"
        title="Audit log"
        description="Every sensitive platform-admin action, newest first."
        icon={History}
        actions={
          <label className="relative block w-full sm:w-56">
            <span className="sr-only">Filter by action</span>
            <select
              aria-label="Filter by action"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white pl-3 pr-9 text-sm text-ink outline-none transition-colors hover:border-neutral-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 [&::-ms-expand]:hidden"
            >
              <option value="">All actions</option>
              {PLATFORM_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {getActionMeta(a).label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          </label>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(log) => log.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={
          action ? "No entries for this action yet." : "No activity recorded yet."
        }
        emptyIcon={History}
        skeletonRows={8}
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
