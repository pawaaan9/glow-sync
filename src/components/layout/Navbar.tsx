"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/search", label: "Find a Salon" },
  { href: "/dashboard/customer", label: "My Bookings" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-purple-500 text-white">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg text-neutral-900">GlowSync</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-rose-50 hover:text-rose-700",
                pathname === link.href && "bg-rose-50 text-rose-700",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button href="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button href="/register" variant="primary" size="sm">
            Sign up
          </Button>
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-neutral-100 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-rose-50 hover:text-rose-700",
                  pathname === link.href && "bg-rose-50 text-rose-700",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-neutral-100 pt-3">
              <Button href="/login" variant="outline" size="sm" fullWidth onClick={() => setOpen(false)}>
                Log in
              </Button>
              <Button href="/register" variant="primary" size="sm" fullWidth onClick={() => setOpen(false)}>
                Sign up
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
