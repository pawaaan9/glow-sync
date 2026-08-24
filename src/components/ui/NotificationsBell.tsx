"use client";

import { useMarkNotificationRead, useMyNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { data } = useMyNotifications();
  const markRead = useMarkNotificationRead();

  const items = data?.items ?? [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[0.6rem] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="animate-rise absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-[0_24px_50px_-24px_rgba(27,20,32,0.4)]">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="font-display text-sm text-ink">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-400">
                  You&apos;re all caught up.
                </p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.isRead && markRead.mutate(n.id)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-neutral-50 px-4 py-3 text-left transition-colors hover:bg-neutral-50",
                      !n.isRead && "bg-rose-50/40",
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-ink">
                      {!n.isRead && <span className="size-1.5 shrink-0 rounded-full bg-rose-500" />}
                      {n.title}
                    </span>
                    <span className="line-clamp-2 text-xs text-neutral-500">{n.message}</span>
                  </button>
                ))
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => items.filter((n) => !n.isRead).forEach((n) => markRead.mutate(n.id))}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-neutral-100 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <CheckCheck className="size-3.5" />
                Mark all as read
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
