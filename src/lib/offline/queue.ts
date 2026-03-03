import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "enzi-offline";
const STORE_NAME = "action-queue";
const DB_VERSION = 1;

export interface OfflineAction {
  id?: number;
  type: "registerMeal" | "registerManualMeal" | "undoMeal";
  payload: Record<string, unknown>;
  createdAt: number;
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
}

export async function enqueueAction(
  action: Omit<OfflineAction, "id">
): Promise<void> {
  const db = await getDB();
  await db.add(STORE_NAME, action);
}

export async function dequeueAllActions(): Promise<OfflineAction[]> {
  const db = await getDB();
  const actions = await db.getAll(STORE_NAME);
  // Clear all after reading
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.clear();
  await tx.done;
  return actions;
}

export async function getQueueSize(): Promise<number> {
  const db = await getDB();
  return db.count(STORE_NAME);
}
