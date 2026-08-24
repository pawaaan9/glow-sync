"use client";

import { Pagination } from "@/components/ui/Pagination";
import { QueryStates } from "@/components/ui/QueryStates";
import { useAuditLogs } from "@/hooks/use-platform-admin";
import { useState } from "react";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAuditLogs({ page, limit: 25 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink">Audit log</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every sensitive platform-admin action, in order.
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Target salon</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <QueryStates
                isLoading={isLoading}
                isError={isError}
                isEmpty={!isLoading && (data?.items.length ?? 0) === 0}
                emptyMessage="No activity recorded yet."
                colSpan={4}
              >
                {data?.items.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-ink">
                      {log.action.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {log.actorRole.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{log.targetSalonId ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(log.createdAt).toLocaleString()}
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
