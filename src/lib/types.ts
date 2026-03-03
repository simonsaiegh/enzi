import { Timestamp } from "firebase/firestore";

export interface Household {
  petName: string;
  petNickname: string;
  petBreed: string;
  alertThresholdMinutes: number;
  lastAlertSentAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Member {
  name: string;
  createdAt: Timestamp;
  lastSeenAt: Timestamp;
}

export interface Dispenser {
  id: string;
  name: string;
  icon: string;
  color: string;
  defaultAmountGrams: number;
  antiDuplicateWindowSeconds: number;
  mode: "auto" | "confirm";
  sortOrder: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Token {
  dispenserId: string;
  createdAt: Timestamp;
  lastUsedAt: Timestamp | null;
}

export interface MealEvent {
  id: string;
  dispenserId: string;
  dispenserName: string;
  dispenserIcon: string;
  dispenserColor: string;
  memberId: string;
  memberName: string;
  amountGrams: number;
  notes: string;
  source: "nfc" | "manual";
  tokenId: string | null;
  undone: boolean;
  undoneAt: Timestamp | null;
  undoneBy: string | null;
  timestamp: Timestamp;
  createdAt: Timestamp;
}

export interface Device {
  memberId: string;
  memberName: string;
  fcmToken: string;
  userAgent: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Cloud Function request/response types
export interface RegisterMealRequest {
  token: string;
  memberId: string;
  memberName: string;
}

export interface RegisterMealResponse {
  success: boolean;
  duplicate: boolean;
  eventId?: string;
  event?: Omit<MealEvent, "id">;
  existingEvent?: MealEvent;
  error?: string;
}

export interface UndoMealRequest {
  eventId: string;
  memberId: string;
}

export interface UndoMealResponse {
  success: boolean;
  error?: string;
}

export interface RegisterManualMealRequest {
  dispenserId: string;
  memberId: string;
  memberName: string;
  amountGrams?: number;
  notes?: string;
}
