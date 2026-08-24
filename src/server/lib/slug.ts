import slugify from "slugify";
import { db } from "@/server/config/firebase";
import { COLLECTIONS } from "@/lib/shared";

/** Generates a unique salon slug, appending a numeric suffix on collision. */
export async function generateUniqueSalonSlug(name: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true }) || "salon";
  let candidate = base;
  let attempt = 0;

  // Collisions are rare and the collection is small at MVP scale, so a
  // simple existence check loop is fine; revisit if salon counts grow large.
  while (attempt < 50) {
    const existing = await db
      .collection(COLLECTIONS.SALONS)
      .where("slug", "==", candidate)
      .limit(1)
      .get();
    if (existing.empty) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt + 1}`;
  }

  return `${base}-${Date.now()}`;
}
