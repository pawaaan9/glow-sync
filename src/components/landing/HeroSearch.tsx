"use client";

import { Button } from "@/components/ui/Button";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const rotatingTerms = [
  "a balayage colour",
  "a hot stone massage",
  "a gel manicure",
  "a hydrafacial",
  "a classic fade",
];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [termIndex, setTermIndex] = useState(0);

  // Cycle the placeholder so the empty state hints at what is searchable.
  useEffect(() => {
    const id = setInterval(
      () => setTermIndex((i) => (i + 1) % rotatingTerms.length),
      2600,
    );
    return () => clearInterval(id);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (city) params.set("city", city);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="group/form relative w-full max-w-3xl"
    >
      <div className="absolute -inset-0.5 rounded-4xl bg-linear-to-r from-rose-300 via-purple-300 to-amber-200 opacity-50 blur-lg transition-opacity duration-500 group-focus-within/form:opacity-90 sm:rounded-full" />

      <div className="relative flex w-full flex-col gap-2 rounded-4xl border border-white/70 bg-white p-2 shadow-[0_20px_50px_-24px_rgba(217,36,88,0.45)] sm:flex-row sm:items-center sm:rounded-full">
        <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3">
          <Search className="size-4.5 shrink-0 text-rose-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search treatments or salons"
            placeholder={`Search ${rotatingTerms[termIndex]}...`}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
          />
        </div>

        <div className="hidden h-8 w-px bg-neutral-200 sm:block" />

        <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3 sm:max-w-52">
          <MapPin className="size-4.5 shrink-0 text-purple-400" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="City"
            placeholder="Anywhere"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
          />
        </div>

        <Button type="submit" size="lg" className="shrink-0 sm:px-8">
          Search
        </Button>
      </div>
    </form>
  );
}
