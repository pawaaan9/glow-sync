import { FieldValue } from "firebase-admin/firestore";
import slugify from "slugify";
import { db } from "@/server/config/firebase";
import {
  AUDIT_ACTIONS,
  COLLECTIONS,
  ROLES,
  type SalonCategoryCreateInput,
  type SalonCategoryDTO,
  type SalonCategoryUpdateInput,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { createAuditLog } from "@/server/lib/auditLog";
import { serializeSalonCategory } from "@/server/lib/serializers";
import type { SalonCategoryDocument } from "@/server/types/firestore";

/**
 * Salon categories are super-admin-managed data. The document id is the
 * slug itself, so slug uniqueness is free and a lookup by slug (at
 * registration) is a single get(). The collection starts empty — an admin
 * defines every category from /platform-admin/categories.
 */

const categoriesRef = () => db.collection(COLLECTIONS.SALON_CATEGORIES);

function slugForLabel(label: string): string {
  return (
    slugify(label, { lower: true, strict: true, replacement: "_" }).replace(/-+/g, "_") || "category"
  );
}

async function loadAllDocs(): Promise<SalonCategoryDocument[]> {
  const snap = await categoriesRef().get();
  return snap.docs
    .map((d) => d.data() as SalonCategoryDocument)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

async function salonCountsBySlug(slugs: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  await Promise.all(
    slugs.map(async (slug) => {
      const agg = await db
        .collection(COLLECTIONS.SALONS)
        .where("category", "==", slug)
        .count()
        .get();
      counts.set(slug, agg.data().count);
    }),
  );
  return counts;
}

/** Full list with usage counts — for the platform-admin console. */
export async function listSalonCategoriesForAdmin(): Promise<SalonCategoryDTO[]> {
  const docs = await loadAllDocs();
  const counts = await salonCountsBySlug(docs.map((d) => d.slug));
  return docs.map((d) => serializeSalonCategory(d, counts.get(d.slug) ?? 0));
}

/** Active categories only — for the public registration form. */
export async function listActiveSalonCategories(): Promise<SalonCategoryDTO[]> {
  const docs = await loadAllDocs();
  return docs.filter((d) => d.isActive).map((d) => serializeSalonCategory(d));
}

export async function createSalonCategory(
  input: SalonCategoryCreateInput,
  adminUid: string,
): Promise<SalonCategoryDTO> {
  const slug = (input.slug ?? slugForLabel(input.label)).trim();
  if (!slug) throw ApiError.validation("Could not derive a slug from that name");

  const ref = categoriesRef().doc(slug);
  if ((await ref.get()).exists) {
    throw ApiError.conflict(`A category with the slug "${slug}" already exists`);
  }

  const existing = await loadAllDocs();
  const nextSortOrder = existing.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;

  const doc: SalonCategoryDocument = {
    id: slug,
    slug,
    label: input.label.trim(),
    isActive: input.isActive,
    sortOrder: nextSortOrder,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(doc);

  createAuditLog({
    action: AUDIT_ACTIONS.CATEGORY_CREATED,
    actorId: adminUid,
    actorRole: ROLES.PLATFORM_ADMIN,
    metadata: { slug, label: doc.label },
  });

  return serializeSalonCategory(doc, 0);
}

export async function updateSalonCategory(
  id: string,
  input: SalonCategoryUpdateInput,
  adminUid: string,
): Promise<SalonCategoryDTO> {
  const ref = categoriesRef().doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Category not found");
  const current = snap.data() as SalonCategoryDocument;

  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (input.label !== undefined) patch.label = input.label.trim();
  if (input.isActive !== undefined) patch.isActive = input.isActive;
  if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;

  await ref.update(patch);

  createAuditLog({
    action: AUDIT_ACTIONS.CATEGORY_UPDATED,
    actorId: adminUid,
    actorRole: ROLES.PLATFORM_ADMIN,
    metadata: { slug: current.slug, changes: input },
  });

  const merged = { ...current, ...patch } as SalonCategoryDocument;
  const count = (await salonCountsBySlug([current.slug])).get(current.slug) ?? 0;
  return serializeSalonCategory(merged, count);
}

export async function deleteSalonCategory(id: string, adminUid: string): Promise<void> {
  const ref = categoriesRef().doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Category not found");
  const current = snap.data() as SalonCategoryDocument;

  const inUse = await db
    .collection(COLLECTIONS.SALONS)
    .where("category", "==", current.slug)
    .limit(1)
    .get();
  if (!inUse.empty) {
    throw ApiError.conflict(
      "This category is used by at least one salon. Deactivate it instead of deleting.",
    );
  }

  await ref.delete();

  createAuditLog({
    action: AUDIT_ACTIONS.CATEGORY_DELETED,
    actorId: adminUid,
    actorRole: ROLES.PLATFORM_ADMIN,
    metadata: { slug: current.slug, label: current.label },
  });
}

/**
 * Throws a validation error unless `slug` is a known, active category.
 * Called when a salon owner picks a category at registration or resubmit,
 * so a stale or tampered value can't slip a dead category into a salon.
 */
export async function assertActiveSalonCategory(slug: string): Promise<void> {
  const snap = await categoriesRef().doc(slug).get();
  if (!snap.exists || !(snap.data() as SalonCategoryDocument).isActive) {
    throw ApiError.validation("Choose a valid salon category");
  }
}
