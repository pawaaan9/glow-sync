import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { bucket, db } from "@/server/config/firebase";
import { COLLECTIONS, SALON_SUBCOLLECTIONS } from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { serializeSalon, serializeStaff } from "@/server/lib/serializers";
import { EXTENSION_BY_MIME } from "@/server/http/upload";
import type { SalonDocument, StaffDocument } from "@/server/types/firestore";

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
}

async function loadSalon(salonId: string): Promise<SalonDocument> {
  const snap = await db.collection(COLLECTIONS.SALONS).doc(salonId).get();
  if (!snap.exists) throw ApiError.notFound("Salon not found");
  return snap.data() as SalonDocument;
}

/** Logos are public marketing assets — displayed on salon cards/search. */
export async function uploadSalonLogo(salonId: string, file: UploadedFile) {
  const salon = await loadSalon(salonId);
  const ext = EXTENSION_BY_MIME[file.mimetype] ?? "bin";
  const path = `salon-logos/${salonId}/logo.${ext}`;

  const blob = bucket.file(path);
  await blob.save(file.buffer, { contentType: file.mimetype, public: true });

  const logoUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

  await db.collection(COLLECTIONS.SALONS).doc(salonId).update({
    logoUrl,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return serializeSalon({ ...salon, logoUrl });
}

/**
 * Verification documents are compliance-sensitive: stored at a private
 * path (never made public, no permanent public URL) and readable only via
 * getVerificationDocumentDownloadUrl's short-lived signed URL.
 */
export async function uploadVerificationDocument(salonId: string, file: UploadedFile) {
  const salon = await loadSalon(salonId);
  const ext = EXTENSION_BY_MIME[file.mimetype] ?? "bin";
  const path = `verification-documents/${salonId}/document.${ext}`;

  const blob = bucket.file(path);
  await blob.save(file.buffer, { contentType: file.mimetype, public: false });

  await db.collection(COLLECTIONS.SALONS).doc(salonId).update({
    verificationDocumentPath: path,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return serializeSalon({ ...salon, verificationDocumentPath: path });
}

/** Cover image shown on the salon's public profile header. */
export async function uploadSalonCoverImage(salonId: string, file: UploadedFile) {
  const salon = await loadSalon(salonId);
  const ext = EXTENSION_BY_MIME[file.mimetype] ?? "bin";
  const path = `salon-covers/${salonId}/cover.${ext}`;

  const blob = bucket.file(path);
  await blob.save(file.buffer, { contentType: file.mimetype, public: true });

  const coverImageUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

  await db.collection(COLLECTIONS.SALONS).doc(salonId).update({
    coverImageUrl,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return serializeSalon({ ...salon, coverImageUrl });
}

/** Appends one photo to the salon's gallery; each upload gets its own path so earlier ones survive. */
export async function addSalonGalleryImage(salonId: string, file: UploadedFile) {
  const salon = await loadSalon(salonId);
  const ext = EXTENSION_BY_MIME[file.mimetype] ?? "bin";
  const path = `salon-gallery/${salonId}/${randomUUID()}.${ext}`;

  const blob = bucket.file(path);
  await blob.save(file.buffer, { contentType: file.mimetype, public: true });

  const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

  await db.collection(COLLECTIONS.SALONS).doc(salonId).update({
    galleryUrls: FieldValue.arrayUnion(url),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return serializeSalon({ ...salon, galleryUrls: [...(salon.galleryUrls ?? []), url] });
}

export async function removeSalonGalleryImage(salonId: string, url: string) {
  const salon = await loadSalon(salonId);

  await db.collection(COLLECTIONS.SALONS).doc(salonId).update({
    galleryUrls: FieldValue.arrayRemove(url),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return serializeSalon({
    ...salon,
    galleryUrls: (salon.galleryUrls ?? []).filter((u) => u !== url),
  });
}

/** A staff member's profile photo. */
export async function uploadStaffPhoto(salonId: string, staffId: string, file: UploadedFile) {
  const staffRef = db
    .collection(COLLECTIONS.SALONS)
    .doc(salonId)
    .collection(SALON_SUBCOLLECTIONS.STAFF)
    .doc(staffId);
  const staffSnap = await staffRef.get();
  if (!staffSnap.exists) throw ApiError.notFound("Staff member not found");
  const staff = staffSnap.data() as StaffDocument;

  const ext = EXTENSION_BY_MIME[file.mimetype] ?? "bin";
  const path = `staff-photos/${salonId}/${staffId}.${ext}`;

  const blob = bucket.file(path);
  await blob.save(file.buffer, { contentType: file.mimetype, public: true });

  const photoUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
  await staffRef.update({ photoUrl, updatedAt: FieldValue.serverTimestamp() });

  return serializeStaff({ ...staff, photoUrl });
}

/** Short-lived signed URL — the only way to read a verification document. */
export async function getVerificationDocumentDownloadUrl(salonId: string): Promise<string> {
  const salon = await loadSalon(salonId);
  if (!salon.verificationDocumentPath) {
    throw ApiError.notFound("No verification document has been uploaded for this salon");
  }

  const [url] = await bucket.file(salon.verificationDocumentPath).getSignedUrl({
    action: "read",
    expires: Date.now() + 5 * 60 * 1000,
  });

  return url;
}
