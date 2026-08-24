import { FieldValue } from "firebase-admin/firestore";
import { bucket, db } from "@/server/config/firebase";
import { COLLECTIONS } from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import { serializeSalon } from "@/server/lib/serializers";
import { EXTENSION_BY_MIME } from "@/server/http/upload";
import type { SalonDocument } from "@/server/types/firestore";

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
