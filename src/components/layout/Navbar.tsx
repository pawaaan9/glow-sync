"use client";

import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { salons, serviceCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "/search", label: "Find a Salon", mega: true },
  { href: "/dashboard/customer", label: "My Bookings", badge: true },
];

const spotlight = salons.find((s) => s.featured) ?? salons[0];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/search?query=${encodeURIComponent(query)}` : "/search");
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border transition-all duration-300",
          scrolled || searchOpen
            ? "glass border-white/70 px-3 py-2 shadow-[0_18px_40px_-24px_rgba(27,20,32,0.45)]"
            : "border-transparent bg-white/40 px-3 py-2.5 backdrop-blur-sm",
        )}
      >
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative flex size-9 items-center justify-center">
            <span className="absolute inset-0 rounded-xl bg-linear-to-br from-rose-400 to-purple-500 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-70" />
            <Image
              src="/logo1.png"
              alt="GlowSync"
              width={36}
              height={36}
              className="relative size-9 rounded-xl transition-transform duration-500 group-hover:rotate-[8deg]"
              priority
            />
            <Sparkles className="absolute -right-1 -top-1 size-3.5 scale-0 text-amber-400 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
          </span>
          <span className="font-display hidden text-xl text-ink sm:inline">
            Glow<span className="text-gradient">Sync</span>
          </span>
        </Link>

        {/* Center: nav links (swaps out for the search field when active) */}
        <div className="relative hidden flex-1 items-center justify-center md:flex">
          <div
            className={cn(
              "flex items-center gap-1 transition-all duration-300",
              searchOpen ? "pointer-events-none scale-95 opacity-0" : "scale-100 opacity-100",
            )}
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <div key={link.href} className="group/nav relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-200",
                      active ? "text-white" : "text-neutral-600 hover:text-rose-700",
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-rose-500 to-purple-500 shadow-[0_4px_14px_-6px_var(--color-rose-500)]" />
                    )}
                    {link.label}
                    {link.mega && (
                      <ChevronDown className="size-3.5 transition-transform duration-300 group-hover/nav:rotate-180" />
                    )}
                    {link.badge && (
                      <span className="relative ml-0.5 flex size-1.5">
                        <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-rose-400" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-rose-500" />
                      </span>
                    )}
                  </Link>

                  {link.mega && (
                    <div className="pointer-events-none absolute left-1/2 top-full z-50 w-[30rem] -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-3 group-hover/nav:opacity-100">
                      <div className="grain relative overflow-hidden rounded-3xl border border-white/70 bg-white p-5 shadow-[0_30px_60px_-24px_rgba(27,20,32,0.35)]">
                        <div className="grid grid-cols-[1fr_auto] gap-5">
                          <div>
                            <p className="eyebrow text-rose-600">Browse by category</p>
                            <div className="mt-3 grid grid-cols-2 gap-1.5">
                              {serviceCategories.map((c) => (
                                <Link
                                  key={c.id}
                                  href={`/search?category=${c.id}`}
                                  className="group/cat flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-sm text-neutral-700 transition-colors hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-100 to-purple-100 text-rose-600 transition-transform duration-300 group-hover/cat:scale-110">
                                    <CategoryIcon icon={c.icon} className="size-4" />
                                  </span>
                                  {c.name}
                                </Link>
                              ))}
                            </div>
                          </div>

                          <Link
                            href={`/salons/${spotlight.slug}`}
                            className="group/spot relative block w-36 shrink-0 overflow-hidden rounded-2xl"
                          >
                            <Image
                              src={spotlight.coverImageUrl}
                              alt={spotlight.name}
                              fill
                              sizes="144px"
                              className="object-cover transition-transform duration-500 group-hover/spot:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-transparent" />
                            <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[0.6rem] font-semibold text-amber-950">
                              Trending
                            </span>
                            <div className="absolute inset-x-2 bottom-2">
                              <p className="truncate text-xs font-medium text-white">
                                {spotlight.name}
                              </p>
                              <span className="mt-0.5 flex items-center gap-1 text-[0.65rem] text-white/80">
                                <Star className="size-2.5 fill-amber-400 text-amber-400" />
                                {spotlight.rating.toFixed(1)}
                              </span>
                            </div>
                          </Link>
                        </div>

                        <Link
                          href="/search"
                          className="group/all mt-4 flex items-center justify-between rounded-2xl border-t border-neutral-100 pt-4 text-sm font-medium text-rose-600"
                        >
                          Browse all salons
                          <ArrowRight className="size-4 transition-transform duration-300 group-hover/all:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inline search field, absolutely centered so it doesn't reflow the bar */}
          <form
            onSubmit={submitSearch}
            className={cn(
              "absolute inset-y-0 left-1/2 flex w-full max-w-sm -translate-x-1/2 items-center gap-2 rounded-full bg-neutral-50 px-4 transition-all duration-300",
              searchOpen
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
          >
            <Search className="size-4 shrink-0 text-rose-400" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              placeholder="Search treatments, salons..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
            />
          </form>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? "Close search" : "Open search"}
            className={cn(
              "flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200",
              searchOpen
                ? "bg-rose-500 text-white"
                : "text-neutral-500 hover:bg-rose-50 hover:text-rose-600",
            )}
          >
            {searchOpen ? <X className="size-4.5" /> : <Search className="size-4.5" />}
          </button>
          <Button href="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button href="/register" variant="primary" size="sm" icon={<Sparkles className="size-3.5" />}>
            Sign up
          </Button>
        </div>

        <button
          type="button"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200/70 bg-white/70 text-neutral-700 backdrop-blur transition-colors hover:bg-rose-50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="animate-rise mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_24px_50px_-24px_rgba(27,20,32,0.4)] backdrop-blur-xl md:hidden">
          <form
            onSubmit={submitSearch}
            className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3.5"
          >
            <Search className="size-4 shrink-0 text-rose-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search treatments, salons..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
            />
          </form>

          <div className="px-4 pt-3">
            <p className="eyebrow text-rose-600">Browse by category</p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {serviceCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/search?category=${c.id}`}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-100 py-3 text-center text-xs font-medium text-neutral-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  <CategoryIcon icon={c.icon} className="size-4 text-rose-500" />
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium tracking-tight text-neutral-700 transition-colors hover:bg-rose-50 hover:text-rose-700",
                  pathname === link.href && "bg-linear-to-r from-rose-50 to-purple-50 text-rose-700",
                )}
              >
                {link.label}
                <ArrowRight className="size-4 opacity-40" />
              </Link>
            ))}
          </div>

          <div className="flex gap-2 border-t border-neutral-100 px-4 py-4">
            <Button href="/login" variant="outline" size="sm" fullWidth onClick={() => setOpen(false)}>
              Log in
            </Button>
            <Button href="/register" variant="primary" size="sm" fullWidth onClick={() => setOpen(false)}>
              Sign up
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
