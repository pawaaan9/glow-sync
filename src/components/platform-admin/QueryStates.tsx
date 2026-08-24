import { AlertTriangle, Loader2, SearchX } from "lucide-react";
import type { ReactNode } from "react";

/** Consistent loading / error / empty handling for the admin list pages. */
export function QueryStates({
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "Nothing to show yet.",
  colSpan,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  /** When set, renders inside a <tr><td colSpan> for use in a <table>. */
  colSpan?: number;
  children: ReactNode;
}) {
  const wrap = (content: ReactNode) =>
    colSpan ? (
      <tr>
        <td colSpan={colSpan} className="p-0">
          {content}
        </td>
      </tr>
    ) : (
      content
    );

  if (isLoading) {
    return wrap(
      <div className="flex flex-col items-center gap-3 py-16 text-neutral-400">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>,
    );
  }

  if (isError) {
    return wrap(
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="size-5" />
        </span>
        <p className="text-sm text-neutral-500">Something went wrong loading this data.</p>
      </div>,
    );
  }

  if (isEmpty) {
    return wrap(
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <SearchX className="size-5" />
        </span>
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>,
    );
  }

  return <>{children}</>;
}
