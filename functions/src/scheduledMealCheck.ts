import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendToAllDevices } from "./lib/fcm";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const scheduledMealCheck = onSchedule(
  {
    schedule: "every 30 minutes",
    region: "us-central1",
    timeZone: "America/Argentina/Buenos_Aires",
  },
  async () => {
    // Get household config
    const householdDoc = await db.collection("household").doc("main").get();
    if (!householdDoc.exists) return;

    const household = householdDoc.data()!;
    const thresholdMinutes = household.alertThresholdMinutes || 480;

    // Get last non-undone meal
    const lastMealQuery = await db
      .collection("events")
      .where("undone", "==", false)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (lastMealQuery.empty) {
      // No meals ever recorded, send alert
      await sendToAllDevices(
        "Sin registros",
        "No hay comidas registradas para Enzo"
      );
      return;
    }

    const lastMeal = lastMealQuery.docs[0].data();
    const lastMealTime = lastMeal.timestamp.toMillis();
    const elapsedMinutes = (Date.now() - lastMealTime) / (1000 * 60);

    if (elapsedMinutes < thresholdMinutes) {
      return; // All good, Enzo ate recently
    }

    // Check if we already sent an alert recently (avoid spam)
    const lastAlertSent = household.lastAlertSentAt?.toMillis() || 0;
    const minAlertInterval = thresholdMinutes * 60 * 1000 * 0.5; // Half the threshold

    if (Date.now() - lastAlertSent < minAlertInterval) {
      return; // Already alerted recently
    }

    // Send alert
    const hours = Math.floor(elapsedMinutes / 60);
    const mins = Math.round(elapsedMinutes % 60);
    const timeStr =
      hours > 0 ? `${hours}h ${mins}min` : `${mins} minutos`;

    await sendToAllDevices(
      "Enzo no comio",
      `Hace ${timeStr} que no se registra comida`
    );

    // Update last alert time
    await db.collection("household").doc("main").update({
      lastAlertSentAt: admin.firestore.Timestamp.now(),
    });
  }
);
