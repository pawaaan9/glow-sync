"use client";

import { useAuth } from "@/providers/auth-provider";
import { LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { me, signOut } = useAuth();

  const name = me?.user.fullName ?? "Admin";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 py-1 pl-1 pr-3 transition-colors hover:border-rose-200"
      >
        <span className="font-display flex size-8 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-purple-600 text-sm text-white">
          {initial}
        </span>
        <span className="hidden text-sm font-medium text-ink sm:inline">{name}</span>
      </button>

      {open && (
        <>
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="animate-rise absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_24px_50px_-24px_rgba(27,20,32,0.4)]">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="truncate text-sm font-medium text-ink">{name}</p>
              <p className="truncate text-xs text-neutral-400">{me?.user.email}</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[0.65rem] font-medium text-purple-700">
                <ShieldCheck className="size-3" />
                Platform admin
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-red-600"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
