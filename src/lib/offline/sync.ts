import { dequeueAllActions } from "./queue";
import { callRegisterMeal, callRegisterManualMeal, callUndoMeal } from "@/lib/firebase/functions";

export async function syncOfflineQueue(): Promise<{
  synced: number;
  failed: number;
}> {
  const actions = await dequeueAllActions();
  let synced = 0;
  let failed = 0;

  for (const action of actions) {
    try {
      switch (action.type) {
        case "registerMeal": {
          const { token, memberId, memberName } = action.payload as {
            token: string;
            memberId: string;
            memberName: string;
          };
          await callRegisterMeal(token, memberId, memberName);
          synced++;
          break;
        }
        case "registerManualMeal": {
          await callRegisterManualMeal(
            action.payload as {
              dispenserId: string;
              memberId: string;
              memberName: string;
              amountGrams?: number;
              notes?: string;
            }
          );
          synced++;
          break;
        }
        case "undoMeal": {
          const { eventId, memberId } = action.payload as {
            eventId: string;
            memberId: string;
          };
          await callUndoMeal(eventId, memberId);
          synced++;
          break;
        }
        default:
          failed++;
      }
    } catch (error) {
      console.error("Failed to sync offline action:", error);
      failed++;
    }
  }

  return { synced, failed };
}
