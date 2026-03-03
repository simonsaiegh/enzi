import { httpsCallable } from "firebase/functions";
import { functions } from "./config";
import type {
  RegisterMealRequest,
  RegisterMealResponse,
  UndoMealRequest,
  UndoMealResponse,
  RegisterManualMealRequest,
} from "../types";

function getCallable<TReq, TRes>(name: string) {
  if (!functions) {
    throw new Error("Firebase no configurado. Agregá las variables de entorno en .env.local");
  }
  return httpsCallable<TReq, TRes>(functions, name);
}

export async function callRegisterMeal(
  token: string,
  memberId: string,
  memberName: string
): Promise<RegisterMealResponse> {
  const fn = getCallable<RegisterMealRequest, RegisterMealResponse>("registerMealByToken");
  const result = await fn({ token, memberId, memberName });
  return result.data;
}

export async function callRegisterManualMeal(
  data: RegisterManualMealRequest
): Promise<RegisterMealResponse> {
  const fn = getCallable<RegisterManualMealRequest, RegisterMealResponse>("registerManualMeal");
  const result = await fn(data);
  return result.data;
}

export async function callUndoMeal(
  eventId: string,
  memberId: string
): Promise<UndoMealResponse> {
  const fn = getCallable<UndoMealRequest, UndoMealResponse>("undoMeal");
  const result = await fn({ eventId, memberId });
  return result.data;
}
