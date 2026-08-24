"use client";

import { Button } from "@/components/ui/Button";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

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
      className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-neutral-100 bg-white p-2 shadow-lg shadow-rose-100/50 sm:flex-row sm:rounded-full"
    >
      <div className="flex flex-1 items-center gap-2 rounded-full px-4 py-2.5">
        <Search className="size-4 shrink-0 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search treatments, salons, spas..."
          className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
      </div>
      <div className="hidden w-px bg-neutral-100 sm:block" />
      <div className="flex flex-1 items-center gap-2 rounded-full px-4 py-2.5">
        <MapPin className="size-4 shrink-0 text-neutral-400" />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
      </div>
      <Button type="submit" size="lg" className="shrink-0">
        Search
      </Button>
    </form>
  );
}
