"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useVerificationHistory } from "@/hooks/use-platform-admin";
import { getActionMeta, relativeTime } from "@/lib/admin-ui";
import type { SalonVerificationHistoryDTO } from "@/lib/shared";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Eye, RotateCcw, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Groups consecutive entries under the day they happened on. */
function groupByDay(entries: SalonVerificationHistoryDTO[]) {
  const groups: { day: string; label: string; entries: SalonVerificationHistoryDTO[] }[] = [];

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const day = date.toDateString();
    const last = groups.at(-1);
    if (last?.day === day) {
      last.entries.push(entry);
    } else {
      groups.push({
        day,
        label: date.toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        entries: [entry],
      });
    }
  }

  return groups;
}

function TimelineEntry({ entry }: { entry: SalonVerificationHistoryDTO }) {
  const meta = getActionMeta(entry.action);

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Rail joining this marker to the next. */}
      <span
        aria-hidden
        className="absolute left-5 top-11 bottom-0 w-px -translate-x-1/2 bg-neutral-100"
      />

      <span
        className={cn(
          "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
          meta.tone,
        )}
      >
        <meta.icon className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1 rounded-2xl border border-neutral-100 bg-white p-4 transition-shadow duration-300 hover:shadow-[0_16px_36px_-30px_rgba(27,20,32,0.5)]">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <p className="font-medium text-ink">{meta.label}</p>
          <p
            className="shrink-0 text-xs text-neutral-400"
            title={new Date(entry.createdAt).toLocaleString()}
          >
            {relativeTime(entry.createdAt)}
          </p>
        </div>

        {/* The status transition this entry represents. */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          {entry.previousStatus ? (
            <>
              <StatusBadge status={entry.previousStatus} />
              <ArrowRight className="size-3.5 shrink-0 text-neutral-300" />
            </>
          ) : (
            <span className="text-neutral-400">New application</span>
          )}
          <StatusBadge status={entry.newStatus} />
        </div>

        {entry.reason && (
          <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
            {entry.reason}
          </p>
        )}

        <Link
          href={`/platform-admin/salon-applications/${entry.salonId}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline"
        >
          <Eye className="size-3.5" />
          Open salon
        </Link>
      </div>
    </li>
  );
}

export default function VerificationHistoryPage() {
  const [salonId, setSalonId] = useState("");
  const [debouncedSalonId, setDebouncedSalonId] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSalonId(salonId.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [salonId]);

  const { data, isLoading, isError } = useVerificationHistory({
    salonId: debouncedSalonId || undefined,
    page,
    limit: 25,
  });

  const groups = groupByDay(data?.items ?? []);
  const isEmpty = !isLoading && !isError && (data?.items.length ?? 0) === 0;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Records"
        title="Verification history"
        description="Every status change a salon has been through — submissions, approvals, rejections, suspensions, and reinstatements."
        icon={ShieldCheck}
      />

      <div className="rounded-3xl border border-neutral-100 bg-white p-4">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Filter by salon ID..."
          value={salonId}
          onChange={(e) => setSalonId(e.target.value)}
          hint="Paste a salon ID to see just that salon's timeline."
        />
        {debouncedSalonId && (
          <button
            type="button"
            onClick={() => setSalonId("")}
            className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-rose-600"
          >
            <RotateCcw className="size-3" />
            Clear filter
          </button>
        )}
      </div>

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-neutral-100 bg-white px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="size-5" />
          </span>
          <p className="text-sm text-neutral-500">
            Something went wrong loading the history. Please refresh the page.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <span className="size-10 shrink-0 animate-pulse rounded-full bg-neutral-100" />
              <span className="h-28 flex-1 animate-pulse rounded-2xl bg-neutral-100" />
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-neutral-100 bg-white px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <ShieldCheck className="size-5" />
          </span>
          <p className="max-w-sm text-sm text-neutral-500">
            {debouncedSalonId
              ? "No history for that salon ID."
              : "No verification activity recorded yet."}
          </p>
        </div>
      )}

      {!isLoading &&
        groups.map((group) => (
          <section key={group.day}>
            {/* Sticky day heading so the date stays visible while scrolling. */}
            <h2 className="sticky top-16 z-10 -mx-1 mb-4 w-fit rounded-full bg-neutral-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 backdrop-blur">
              {group.label}
            </h2>
            <ol className="flex flex-col">
              {group.entries.map((entry) => (
                <TimelineEntry key={entry.id} entry={entry} />
              ))}
            </ol>
          </section>
        ))}

      {data && data.total > 0 && (
        <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white">
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
