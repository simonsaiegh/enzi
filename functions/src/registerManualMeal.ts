import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { sendToAllDevices } from "./lib/fcm";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const registerManualMeal = onCall(
  { region: "us-central1" },
  async (request) => {
    const { dispenserId, memberId, memberName, amountGrams, notes } =
      request.data;

    if (!dispenserId || !memberId || !memberName) {
      throw new HttpsError(
        "invalid-argument",
        "Se requiere dispenserId, memberId y memberName"
      );
    }

    // Get dispenser info
    const dispenserDoc = await db
      .collection("dispensers")
      .doc(dispenserId)
      .get();
    if (!dispenserDoc.exists) {
      throw new HttpsError("not-found", "Dispensador no encontrado");
    }

    const dispenser = dispenserDoc.data()!;

    // Create meal event
    const now = admin.firestore.Timestamp.now();
    const eventData = {
      dispenserId,
      dispenserName: dispenser.name,
      dispenserIcon: dispenser.icon || "utensils",
      dispenserColor: dispenser.color || "#F59E0B",
      memberId,
      memberName,
      amountGrams: amountGrams ?? dispenser.defaultAmountGrams ?? 0,
      notes: notes || "",
      source: "manual",
      tokenId: null,
      undone: false,
      undoneAt: null,
      undoneBy: null,
      timestamp: now,
      createdAt: now,
    };

    const eventRef = await db.collection("events").add(eventData);

    // Send push notifications
    try {
      await sendToAllDevices(
        `${dispenser.name} (manual)`,
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
