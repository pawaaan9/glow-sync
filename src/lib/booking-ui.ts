import type { BookingStatus } from "@/lib/shared";

export function bookingStatusVariant(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "success" as const;
    case "COMPLETED":
      return "purple" as const;
    case "PENDING_SALON_REVIEW":
    case "PENDING_STAFF_ACCEPTANCE":
      return "warning" as const;
    case "REJECTED_BY_STAFF":
    case "DECLINED_BY_SALON":
    case "CANCELLED_BY_CUSTOMER":
    case "CANCELLED_BY_SALON":
    case "NO_SHOW":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export function formatColomboDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-LK", {
    timeZone: "Asia/Colombo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatColomboTime(iso: string) {
  return new Date(iso).toLocaleString("en-LK", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLkr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}
