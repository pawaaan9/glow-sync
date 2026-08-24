import { COLLECTIONS, type MeResponse } from "@/lib/shared";
import { db } from "@/server/config/firebase";
import { defineRoute } from "@/server/http/route";
import { getAccountDoc } from "@/server/lib/accounts";
import { ApiError } from "@/server/lib/apiError";
import { serializeSalon, serializeUser } from "@/server/lib/serializers";
import type { SalonDocument } from "@/server/types/firestore";

export const runtime = "nodejs";

export const GET = defineRoute({
  auth: true,
  handler: async ({ user: authUser }): Promise<MeResponse> => {
    const account = await getAccountDoc(authUser.uid);
    if (!account) throw ApiError.notFound("Account record not found");
    const user = serializeUser(account.doc);

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
