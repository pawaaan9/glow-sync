"use client";

import { SalonOwnerStatusGate } from "@/components/auth/SalonOwnerStatusGate";

export default function SalonOwnerLayout({ children }: { children: React.ReactNode }) {
  return <SalonOwnerStatusGate>{children}</SalonOwnerStatusGate>;
}
