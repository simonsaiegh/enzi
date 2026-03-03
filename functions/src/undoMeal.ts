import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const UNDO_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export const undoMeal = onCall(
  { region: "us-central1" },
  async (request) => {
    const { eventId, memberId } = request.data;

    if (!eventId || !memberId) {
      throw new HttpsError(
        "invalid-argument",
        "Se requiere eventId y memberId"
      );
    }

    const eventRef = db.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      throw new HttpsError("not-found", "Evento no encontrado");
    }

    const eventData = eventDoc.data()!;

    if (eventData.undone) {
      throw new HttpsError("already-exists", "Este evento ya fue deshecho");
    }

    // Check undo window
    const eventTime = eventData.timestamp.toMillis();
    const elapsed = Date.now() - eventTime;

    if (elapsed > UNDO_WINDOW_MS) {
      throw new HttpsError(
        "deadline-exceeded",
        "Ya paso el tiempo para deshacer (5 min)"
      );
    }

    // Mark as undone
    await eventRef.update({
      undone: true,
      undoneAt: admin.firestore.Timestamp.now(),
      undoneBy: memberId,
    });

    return { success: true };
  }
);
