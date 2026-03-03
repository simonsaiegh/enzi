import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";
import app, { db, isFirebaseConfigured } from "./config";

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  if (!isFirebaseConfigured || !app) return null;

  const supported = await isSupported();
  if (!supported) return null;

  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export async function requestNotificationPermission(
  memberId: string,
  memberName: string
): Promise<boolean> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const messaging = await getMessagingInstance();
    if (!messaging) return false;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("VAPID key not configured");
      return false;
    }

    const fcmToken = await getToken(messaging, { vapidKey });
    if (!fcmToken) return false;

    // Save token to Firestore
    if (!db) return false;
    await addDoc(collection(db, "devices"), {
      memberId,
      memberName,
      fcmToken,
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

export async function setupForegroundMessages(
  onMessageReceived: (title: string, body: string) => void
) {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "Enzi";
    const body = payload.notification?.body || "";
    onMessageReceived(title, body);
  });
}
