import * as admin from "firebase-admin";

export async function sendToAllDevices(
  title: string,
  body: string,
  excludeMemberId?: string
): Promise<void> {
  const db = admin.firestore();
  const devicesSnap = await db.collection("devices").get();

  if (devicesSnap.empty) return;

  const tokens: string[] = [];
  const tokenDocIds: string[] = [];

  devicesSnap.forEach((doc) => {
    const data = doc.data();
    if (excludeMemberId && data.memberId === excludeMemberId) return;
    if (data.fcmToken) {
      tokens.push(data.fcmToken);
      tokenDocIds.push(doc.id);
    }
  });

  if (tokens.length === 0) return;

  const message: admin.messaging.MulticastMessage = {
    notification: { title, body },
    webpush: {
      notification: {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        tag: "enzi-meal",
      },
      fcmOptions: {
        link: "/",
      },
    },
    tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokenDocIds: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (
          !resp.success &&
          resp.error?.code === "messaging/registration-token-not-registered"
        ) {
          failedTokenDocIds.push(tokenDocIds[idx]);
        }
      });

      const batch = db.batch();
      failedTokenDocIds.forEach((docId) => {
        batch.delete(db.collection("devices").doc(docId));
      });
      if (failedTokenDocIds.length > 0) {
        await batch.commit();
      }
    }
  } catch (error) {
    console.error("Error sending FCM notifications:", error);
  }
}
