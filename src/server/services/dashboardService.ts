import type { Timestamp } from "firebase-admin/firestore";
import { db } from "@/server/config/firebase";
import { BOOKING_STATUS, COLLECTIONS, SALON_SUBCOLLECTIONS, type SalonOwnerDashboardDTO } from "@/lib/shared";
import { toColomboLocal } from "@/server/lib/availability";
import { serializeAuditLog, serializeBooking } from "@/server/lib/serializers";
import type { AuditLogDocument, BookingDocument } from "@/server/types/firestore";

export async function getSalonOwnerDashboard(salonId: string): Promise<SalonOwnerDashboardDTO> {
  const [bookingsSnap, staffSnap, servicesSnap, activitySnap] = await Promise.all([
    db.collection(COLLECTIONS.BOOKINGS).where("salonId", "==", salonId).get(),
    db
      .collection(COLLECTIONS.SALONS)
      .doc(salonId)
      .collection(SALON_SUBCOLLECTIONS.STAFF)
      .where("isActive", "==", true)
      .count()
      .get(),
    db
      .collection(COLLECTIONS.SALONS)
      .doc(salonId)
      .collection(SALON_SUBCOLLECTIONS.SERVICES)
      .where("isActive", "==", true)
      .count()
      .get(),
    db.collection(COLLECTIONS.AUDIT_LOGS).where("targetSalonId", "==", salonId).get(),
  ]);

  const now = new Date();
  const today = toColomboLocal(now).date;
  const currentMonth = today.slice(0, 7);

  let todayBookings = 0;
  let pendingRequests = 0;
  let awaitingStaffAcceptance = 0;
  let confirmed = 0;
  let completedThisMonth = 0;
  let cancelledThisMonth = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;
  const upcoming: BookingDocument[] = [];

  for (const doc of bookingsSnap.docs) {
    const b = doc.data() as BookingDocument;
    const startDate = (b.startAt as Timestamp).toDate();
    const local = toColomboLocal(startDate);

    if (local.date === today) todayBookings += 1;
    if (b.status === BOOKING_STATUS.PENDING_SALON_REVIEW) pendingRequests += 1;
    if (b.status === BOOKING_STATUS.PENDING_STAFF_ACCEPTANCE) awaitingStaffAcceptance += 1;
    if (b.status === BOOKING_STATUS.CONFIRMED) confirmed += 1;

    if (b.status === BOOKING_STATUS.COMPLETED && local.date.slice(0, 7) === currentMonth) {
      completedThisMonth += 1;
      monthRevenue += b.servicePriceLkr;
      if (local.date === today) todayRevenue += b.servicePriceLkr;
    }
    if (
      (b.status === BOOKING_STATUS.CANCELLED_BY_CUSTOMER || b.status === BOOKING_STATUS.CANCELLED_BY_SALON) &&
      local.date.slice(0, 7) === currentMonth
    ) {
      cancelledThisMonth += 1;
    }

    if (b.status === BOOKING_STATUS.CONFIRMED && startDate >= now) {
      upcoming.push(b);
    }
  }

  upcoming.sort((a, b) => (a.startAt as Timestamp).toMillis() - (b.startAt as Timestamp).toMillis());

  const recentActivity = activitySnap.docs
    .map((d) => serializeAuditLog({ ...(d.data() as AuditLogDocument), id: d.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return {
    counts: {
      todayBookings,
      pendingRequests,
      awaitingStaffAcceptance,
      confirmed,
      completedThisMonth,
      cancelledThisMonth,
      activeStaff: staffSnap.data().count,
      activeServices: servicesSnap.data().count,
    },
    revenue: { todayLkr: todayRevenue, monthLkr: monthRevenue },
    upcomingAppointments: upcoming.slice(0, 8).map(serializeBooking),
    recentActivity,
  };
}

