"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, SearchX } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

/**
 * Where a column goes in the mobile card:
 * - `primary`   the headline (label hidden)
 * - `secondary` the muted line under the headline (label hidden)
 * - `badge`     pinned top-right beside the headline (label hidden)
 * - `hidden`    desktop table only
 * - default     a labelled row in the card's detail list
 */
type CardSlot = "primary" | "secondary" | "badge" | "hidden";

export interface DataTableColumn<T> {
  /** Stable identity for this column. */
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  cardSlot?: CardSlot;
  /** Extra classes for the desktop <th>/<td> pair. */
  className?: string;
  align?: "left" | "right";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  emptyIcon?: ComponentType<{ className?: string }>;
  /** Rendered in a trailing table cell and in each card's footer. */
  actions?: (row: T) => ReactNode;
  /** Pagination (or anything else) pinned under the table. */
  footer?: ReactNode;
  /** Rows to fake while loading. */
  skeletonRows?: number;
}

function StateShell({
  icon: Icon,
  tone,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  tone: "error" | "empty";
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          tone === "error" ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-400",
        )}
      >
        <Icon className="size-5" />
      </span>
      <p className="max-w-sm text-sm text-neutral-500">{children}</p>
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return <span className={cn("block h-3.5 animate-pulse rounded-full bg-neutral-100", className)} />;
}

/**
 * One dataset, two presentations: a real table from `md` up, and a stack
 * of cards below it so narrow screens never sideways-scroll. Loading,
 * error, and empty states are handled here so pages stay declarative.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  isError = false,
  emptyMessage = "Nothing to show yet.",
  emptyIcon = SearchX,
  actions,
  footer,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const totalCols = columns.length + (actions ? 1 : 0);
  const isEmpty = !isLoading && !isError && rows.length === 0;

  const cardColumns = columns.filter((c) => (c.cardSlot ?? "detail") !== "hidden");
  const primary = cardColumns.find((c) => c.cardSlot === "primary") ?? cardColumns[0];
  const secondary = cardColumns.find((c) => c.cardSlot === "secondary");
  const badge = cardColumns.find((c) => c.cardSlot === "badge");
  const details = cardColumns.filter(
    (c) => c !== primary && c !== secondary && c !== badge,
  );

  const state = (() => {
    if (isError) {
      return (
        <StateShell icon={AlertTriangle} tone="error">
          Something went wrong loading this data. Please refresh the page.
        </StateShell>
      );
    }
    if (isEmpty) {
      return (
        <StateShell icon={emptyIcon} tone="empty">
          {emptyMessage}
        </StateShell>
      );
    }
    return null;
  })();

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white">
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-medium",
                    col.align === "right" && "text-right",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: totalCols }).map((__, colIndex) => (
                    <td key={colIndex} className="px-4 py-4">
                      <SkeletonBar className={colIndex === 0 ? "w-32" : "w-20"} />
                    </td>
                  ))}
                </tr>
              ))}

            {state && (
              <tr>
                <td colSpan={totalCols} className="p-0">
                  {state}
                </td>
              </tr>
            )}

            {!isLoading &&
              !state &&
              rows.map((row) => (
                <tr key={rowKey(row)} className="transition-colors hover:bg-neutral-50/70">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 align-middle",
                        col.align === "right" && "text-right",
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {isLoading && (
          <div className="flex flex-col divide-y divide-neutral-50">
            {Array.from({ length: Math.min(skeletonRows, 3) }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4">
                <SkeletonBar className="h-4 w-40" />
                <SkeletonBar className="w-24" />
                <SkeletonBar className="w-full" />
              </div>
            ))}
          </div>
        )}

        {state}

        {!isLoading && !state && (
          <ul className="flex flex-col divide-y divide-neutral-50">
            {rows.map((row) => (
              <li key={rowKey(row)} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {primary && (
                      <div className="font-medium text-ink">{primary.cell(row)}</div>
                    )}
                    {secondary && (
                      <div className="mt-0.5 text-xs text-neutral-400">{secondary.cell(row)}</div>
                    )}
                  </div>
                  {badge && <div className="shrink-0">{badge.cell(row)}</div>}
                </div>

                {details.length > 0 && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    {details.map((col) => (
                      <div key={col.key} className="col-span-2 flex justify-between gap-4">
                        <dt className="shrink-0 text-xs uppercase tracking-wide text-neutral-400">
                          {col.header}
                        </dt>
                        <dd className="min-w-0 truncate text-right text-neutral-600">
                          {col.cell(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {actions && (
                  <div className="flex flex-wrap items-center gap-4 border-t border-neutral-50 pt-3">
                    {actions(row)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {footer}
    </div>
  );
}
