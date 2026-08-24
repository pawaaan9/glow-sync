import { COLLECTIONS, ROLES } from "@/lib/shared";
import { db } from "@/server/config/firebase";
import { defineRoute } from "@/server/http/route";
import { serializeSalon, serializeUser } from "@/server/lib/serializers";
import type { SalonDocument, UserDocument } from "@/server/types/firestore";

export const runtime = "nodejs";

/** The owner's own application/salon, regardless of status — backs the status pages. */
export const GET = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user: authUser }) => {
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(authUser.uid).get();
    const user = serializeUser({ ...(userSnap.data() as UserDocument), id: userSnap.id });

    let salon = null;
    if (user.salonId) {
      const salonSnap = await db.collection(COLLECTIONS.SALONS).doc(user.salonId).get();
      if (salonSnap.exists) {
        salon = serializeSalon({ ...(salonSnap.data() as SalonDocument), id: salonSnap.id });
      }
    }

    return { user, salon };
  },
});
