import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { sendToAllDevices } from "./lib/fcm";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const registerMealByToken = onCall(
  { region: "us-central1" },
  async (request) => {
    const { token, memberId, memberName } = request.data;

    if (!token || !memberId || !memberName) {
      throw new HttpsError(
        "invalid-argument",
        "Se requiere token, memberId y memberName"
      );
    }

    // 1. Validate token
    const tokenDoc = await db.collection("tokens").doc(token).get();
    if (!tokenDoc.exists) {
      throw new HttpsError("not-found", "Token no valido");
    }

    const tokenData = tokenDoc.data()!;
    const dispenserId = tokenData.dispenserId;

    // 2. Get dispenser info
    const dispenserDoc = await db
      .collection("dispensers")
      .doc(dispenserId)
      .get();
    if (!dispenserDoc.exists) {
      throw new HttpsError("not-found", "Dispensador no encontrado");
    }

    const dispenser = dispenserDoc.data()!;

    // 3. Anti-duplicate check
    const antiDupWindow = dispenser.antiDuplicateWindowSeconds || 60;
    const cutoff = admin.firestore.Timestamp.fromMillis(
      Date.now() - antiDupWindow * 1000
    );

    const duplicateQuery = await db
      .collection("events")
      .where("tokenId", "==", token)
      .where("undone", "==", false)
      .where("timestamp", ">=", cutoff)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (!duplicateQuery.empty) {
      const existingEvent = duplicateQuery.docs[0];
      return {
        success: false,
        duplicate: true,
        existingEvent: {
          id: existingEvent.id,
          ...existingEvent.data(),
        },
      };
    }

    // 4. Create meal event
    const now = admin.firestore.Timestamp.now();
    const eventData = {
      dispenserId,
      dispenserName: dispenser.name,
      dispenserIcon: dispenser.icon || "utensils",
      dispenserColor: dispenser.color || "#F59E0B",
      memberId,
      memberName,
      amountGrams: dispenser.defaultAmountGrams || 0,
      notes: "",
      source: "nfc",
      tokenId: token,
      undone: false,
      undoneAt: null,
      undoneBy: null,
      timestamp: now,
      createdAt: now,
    };

    const eventRef = await db.collection("events").add(eventData);

    // 5. Update token lastUsedAt
    await db.collection("tokens").doc(token).update({
      lastUsedAt: now,
    });

    // 6. Send push notifications to other family members
    try {
      await sendToAllDevices(
        `${dispenser.name}`,
        `Registrado por ${memberName}`,
        memberId
      );
    } catch (error) {
      console.error("Error sending notifications:", error);
    }

    return {
      success: true,
      duplicate: false,
      eventId: eventRef.id,
      event: eventData,
    };
  }
);
