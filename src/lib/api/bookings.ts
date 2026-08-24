import { salons } from "@/lib/mock-data";
import type { Booking, BookingStatus } from "@/lib/types";
import { mockDelay } from "./client";

/**
 * Derives a plausible booking history from the salon catalogue so the
 * dashboard has something to render before the real API exists.
 */
function buildBookings(): Booking[] {
  const plan: { salonIndex: number; offsetDays: number; time: string; status: BookingStatus }[] = [
    { salonIndex: 0, offsetDays: 2, time: "14:30", status: "confirmed" },
    { salonIndex: 3, offsetDays: 6, time: "10:00", status: "pending" },
    { salonIndex: 1, offsetDays: -5, time: "16:00", status: "completed" },
    { salonIndex: 2, offsetDays: -18, time: "11:30", status: "completed" },
    { salonIndex: 5, offsetDays: -32, time: "09:00", status: "cancelled" },
  ];

  return plan.map((entry, i) => {
    const salon = salons[entry.salonIndex];
    const service = salon.services[i % salon.services.length];
    const staff = salon.staff[i % salon.staff.length];

    const date = new Date();
    date.setDate(date.getDate() + entry.offsetDays);

    return {
      id: `b${i + 1}`,
      salonId: salon.id,
      salonName: salon.name,
      serviceId: service.id,
      serviceName: service.name,
      staffId: staff.id,
      staffName: staff.name,
      customerId: "u1",
      customerName: "Ava Rivera",
      date: date.toISOString().slice(0, 10),
      time: entry.time,
      durationMinutes: service.durationMinutes,
      price: service.price,
      status: entry.status,
    };
  });
}

export async function getMyBookings(): Promise<Booking[]> {
  return mockDelay(buildBookings());
}

export function isUpcoming(booking: Booking) {
  return booking.status === "confirmed" || booking.status === "pending";
}
