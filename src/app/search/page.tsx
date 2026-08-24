import { SearchPageClient } from "@/app/search/SearchPageClient";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  return (
    <SearchPageClient
      initialQuery={first(params.query) ?? ""}
      initialCity={first(params.city) ?? ""}
      initialCategory={first(params.category) ?? ""}
    />
  );
}
