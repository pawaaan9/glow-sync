import type { Query, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import type { PaginatedResult } from "@/lib/shared";
import type { PageParams } from "./pagination";

export interface OrderSpec {
  field: string;
  direction: FirebaseFirestore.OrderByDirection;
}

/**
 * A Firestore query that filters on one field and orders by another needs a
 * composite index. Those are declared in firestore.indexes.json, but the
 * declaration only takes effect once deployed — until then Firestore
 * answers with FAILED_PRECONDITION (gRPC code 9) and the endpoint 500s.
 */
export function isMissingIndexError(err: unknown): boolean {
  const candidate = err as { code?: number; details?: string; message?: string };
  if (candidate?.code !== 9) return false;
  return /requires an index/i.test(candidate.details ?? candidate.message ?? "");
}

/** Orderings already warned about, so a missing index logs once, not per request. */
const warned = new Set<string>();

function warnOnce(order: OrderSpec) {
  const key = `${order.field}:${order.direction}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(
    `[firestore] No composite index for an ordered query on "${order.field}". ` +
      "Serving it by sorting in memory, which reads every matching document — " +
      "deploy firestore.indexes.json to restore the indexed path.",
  );
}

function toComparable(value: unknown): number | string {
  if (value && typeof (value as Timestamp).toMillis === "function") {
    return (value as Timestamp).toMillis();
  }
  if (typeof value === "string") return value.toLowerCase();
  if (typeof value === "number") return value;
  return String(value ?? "");
}

function sortDocs(docs: QueryDocumentSnapshot[], order: OrderSpec): QueryDocumentSnapshot[] {
  const sign = order.direction === "desc" ? -1 : 1;
  return [...docs].sort((a, b) => {
    const av = toComparable(a.get(order.field));
    const bv = toComparable(b.get(order.field));
    if (av < bv) return -1 * sign;
    if (av > bv) return 1 * sign;
    return 0;
  });
}

/**
 * Runs `base` ordered by `order`, falling back to fetching unordered and
 * sorting in memory when the composite index is missing.
 *
 * The fallback cannot rescue a query whose *filters* alone need a composite
 * index (an equality filter plus a range filter on another field) — there
 * is no ordering to strip there, so the original error propagates.
 */
export async function getOrderedDocs(
  base: Query,
  order: OrderSpec,
): Promise<QueryDocumentSnapshot[]> {
  try {
    return (await base.orderBy(order.field, order.direction).get()).docs;
  } catch (err) {
    if (!isMissingIndexError(err)) throw err;
    warnOnce(order);
    return sortDocs((await base.get()).docs, order);
  }
}

/**
 * Counts and returns one page of `base` ordered by `order`.
 *
 * The count deliberately runs against the *unordered* query: a total is
 * order-independent, and dropping the orderBy keeps the aggregation on the
 * automatic single-field index instead of demanding the composite one.
 */
export async function paginateOrdered<TDoc, TDto>(
  base: Query,
  order: OrderSpec,
  { page, limit }: PageParams,
  mapDoc: (id: string, data: FirebaseFirestore.DocumentData) => TDoc,
  serialize: (doc: TDoc) => TDto,
): Promise<PaginatedResult<TDto>> {
  const offset = (page - 1) * limit;

  let total: number;
  let docs: QueryDocumentSnapshot[];

  try {
    const [countSnap, pageSnap] = await Promise.all([
      base.count().get(),
      base.orderBy(order.field, order.direction).offset(offset).limit(limit).get(),
    ]);
    total = countSnap.data().count;
    docs = pageSnap.docs;
  } catch (err) {
    if (!isMissingIndexError(err)) throw err;
    warnOnce(order);
    const all = sortDocs((await base.get()).docs, order);
    total = all.length;
    docs = all.slice(offset, offset + limit);
  }

  return {
    items: docs.map((doc) => serialize(mapDoc(doc.id, doc.data()))),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
