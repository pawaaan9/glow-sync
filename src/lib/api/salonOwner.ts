import { apiGet, apiPatch, apiPost } from "@/lib/api/http";
import type { MeResponse, ResubmitSalonApplicationInput, SalonDTO } from "@/lib/shared";

export function getMyApplication() {
  return apiGet<MeResponse>("/api/salon-owner/application");
}

export function resubmitApplication(input: ResubmitSalonApplicationInput) {
  return apiPatch<{ resubmitted: true }>("/api/salon-owner/application/resubmit", input);
}

export function uploadSalonLogo(file: File) {
  const form = new FormData();
  form.set("logo", file);
  return apiPost<SalonDTO>("/api/salon-owner/application/logo", form);
}

export function uploadVerificationDocument(file: File) {
  const form = new FormData();
  form.set("document", file);
  return apiPost<SalonDTO>("/api/salon-owner/application/verification-document", form);
}

export function getMyVerificationDocumentDownloadUrl() {
  return apiGet<{ url: string }>("/api/salon-owner/application/verification-document/download");
}

export function getMySalon() {
  return apiGet<SalonDTO>("/api/salon-owner/salon");
}
