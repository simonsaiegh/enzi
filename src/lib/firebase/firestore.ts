import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { Dispenser, MealEvent, Household, Member } from "../types";
import { getStartOfDay } from "../utils/dates";

const NOOP_UNSUB = () => {};

// --- Household ---

export async function getHousehold(): Promise<Household | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "household", "main"));
  return snap.exists() ? (snap.data() as Household) : null;
}

// --- Members ---

export async function getAllMembers(): Promise<Record<string, Member>> {
  if (!db) return {};
  const snap = await getDocs(collection(db, "members"));
  const members: Record<string, Member> = {};
  snap.forEach((d) => {
    members[d.id] = d.data() as Member;
  });
  return members;
}

// --- Dispensers ---

export function subscribeDispensers(
  callback: (dispensers: Dispenser[]) => void
): () => void {
  if (!db) {
    callback([]);
    return NOOP_UNSUB;
  }

  const q = query(
    collection(db, "dispensers"),
    where("active", "==", true),
    orderBy("sortOrder", "asc")
  );

  return onSnapshot(q, (snap) => {
    const dispensers: Dispenser[] = [];
    snap.forEach((d) => {
      dispensers.push({ id: d.id, ...d.data() } as Dispenser);
    });
    callback(dispensers);
  });
}

export async function getDispenser(id: string): Promise<Dispenser | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "dispensers", id));
  return snap.exists()
    ? ({ id: snap.id, ...snap.data() } as Dispenser)
    : null;
}

// --- Events ---

export function subscribeMealsToday(
  callback: (meals: MealEvent[]) => void
): () => void {
  if (!db) {
    callback([]);
    return NOOP_UNSUB;
  }

  const startOfDay = Timestamp.fromDate(getStartOfDay());

  const q = query(
    collection(db, "events"),
    where("undone", "==", false),
    where("timestamp", ">=", startOfDay),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snap) => {
    const meals: MealEvent[] = [];
    snap.forEach((d) => {
      meals.push({ id: d.id, ...d.data() } as MealEvent);
    });
    callback(meals);
  });
}

export function subscribeLastMeal(
  callback: (meal: MealEvent | null) => void
): () => void {
  if (!db) {
    callback(null);
    return NOOP_UNSUB;
  }

  const q = query(
    collection(db, "events"),
    where("undone", "==", false),
    orderBy("timestamp", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
    } else {
      const d = snap.docs[0];
      callback({ id: d.id, ...d.data() } as MealEvent);
    }
  });
}

export async function getMealHistory(
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  dispenserFilter?: string
): Promise<{
  meals: MealEvent[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  if (!db) return { meals: [], lastDoc: null, hasMore: false };

  const constraints: QueryConstraint[] = [
    where("undone", "==", false),
    orderBy("timestamp", "desc"),
    limit(pageSize + 1),
  ];

  if (dispenserFilter) {
    constraints.unshift(where("dispenserId", "==", dispenserFilter));
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, "events"), ...constraints);
  const snap = await getDocs(q);

  const meals: MealEvent[] = [];
  const docs = snap.docs.slice(0, pageSize);

  docs.forEach((d) => {
    meals.push({ id: d.id, ...d.data() } as MealEvent);
  });

  return {
    meals,
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: snap.docs.length > pageSize,
  };
}
