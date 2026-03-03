import { signInAnonymously, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export async function ensureAnonymousAuth(): Promise<User> {
  if (!auth) throw new Error("Firebase no configurado");
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);
  return result.user;
}

export async function getMemberName(uid: string): Promise<string | null> {
  if (!db) return null;
  const memberDoc = await getDoc(doc(db, "members", uid));
  if (memberDoc.exists()) {
    return memberDoc.data().name;
  }
  return null;
}

export async function setMemberName(
  uid: string,
  name: string
): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, "members", uid),
    {
      name,
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateLastSeen(uid: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, "members", uid),
      { lastSeenAt: serverTimestamp() },
      { merge: true }
    );
  } catch {
    // Non-critical, ignore errors
  }
}
