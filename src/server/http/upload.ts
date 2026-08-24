import "server-only";
import { ApiError } from "@/server/lib/apiError";
import type { NextRequest } from "next/server";

const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalName: string;
  size: number;
}

/**
 * Reads one uploaded file out of a multipart request — the Next-native
 * replacement for multer's memoryStorage. Enforces the same rules: PDF,
 * JPG, and PNG only, 5MB maximum, and the bytes never touch disk.
 *
 * The size check runs against the buffer actually read rather than a
 * client-supplied Content-Length, so a lying header cannot slip a larger
 * file through.
 */
export async function readUploadedFile(
  req: NextRequest,
  field: string,
): Promise<UploadedFile> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw ApiError.validation("Expected a multipart/form-data upload");
  }

  const entry = form.get(field);
  if (!entry || typeof entry === "string") {
    throw ApiError.validation(`Missing file field "${field}"`);
  }

  const file = entry as File;
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw ApiError.validation("Only PDF, JPG, and PNG files are allowed");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw ApiError.validation("File must be 5MB or smaller");
  }

  return {
    buffer,
    mimetype: file.type,
    originalName: file.name,
    size: buffer.byteLength,
  };
}
